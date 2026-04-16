import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';

@Injectable()
export class ProductService {
  private imageDir: string;

  constructor(private prisma: PrismaService) {
    // Save images to frontend/public/products/
    this.imageDir = path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'products');
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  private validateImageUrl(url: string): void {
    try {
      const parsed = new URL(url);
      // Only allow HTTP/HTTPS schemes
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new BadRequestException('Only HTTP/HTTPS URLs allowed for images');
      }
      // Block internal/private IPs
      const hostname = parsed.hostname.toLowerCase();
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'metadata.google.internal'];
      if (blockedHosts.includes(hostname) || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
        throw new BadRequestException('Internal URLs are not allowed');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid image URL');
    }
  }

  private downloadImage(url: string, filename: string, redirectCount = 0): Promise<string> {
    if (redirectCount > 3) {
      return Promise.reject(new Error('Too many redirects'));
    }
    this.validateImageUrl(url);

    return new Promise((resolve, reject) => {
      const filePath = path.join(this.imageDir, filename);
      const file = fs.createWriteStream(filePath);
      const client = url.startsWith('https') ? https : http;

      client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return this.downloadImage(redirectUrl, filename, redirectCount + 1).then(resolve).catch(reject);
          }
        }
        if (response.statusCode !== 200) {
          file.close();
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return reject(new Error(`Failed to download: ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(`/products/${filename}`);
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(err);
      });
    });
  }

  async processImageUrls(imageUrlStr?: string): Promise<string | undefined> {
    if (!imageUrlStr) return undefined;

    const urls = imageUrlStr.split(',').map(u => u.trim()).filter(Boolean);
    const localPaths: string[] = [];

    for (const url of urls) {
      // Already a local path
      if (url.startsWith('/products/')) {
        localPaths.push(url);
        continue;
      }

      // External URL — download it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const ext = this.getExtension(url);
          const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
          const filename = `${Date.now()}-${hash}${ext}`;
          const localPath = await this.downloadImage(url, filename);
          localPaths.push(localPath);
        } catch (err) {
          console.error(`Failed to download image: ${url}`, err);
          // Skip failed downloads
        }
      }
    }

    return localPaths.length > 0 ? localPaths.join(',') : undefined;
  }

  private getExtension(url: string): string {
    const pathname = url.split('?')[0];
    const ext = path.extname(pathname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) return ext;
    return '.jpg';
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    category: string,
    type: string,
    imageUrl?: string,
    stockQuantity?: number,
    gender?: string,
    sizes?: string,
  ) {
    if (type === 'PHYSICAL' && !stockQuantity) {
      throw new BadRequestException('Stock quantity required for physical products');
    }

    const localImageUrl = await this.processImageUrls(imageUrl);

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        price: new Decimal(price),
        category,
        type,
        imageUrl: localImageUrl,
        stockQuantity,
        gender,
        sizes,
        isActive: true,
      },
    });

    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  async getAllProducts(skip: number = 0, take: number = 50) {
    const products = await this.prisma.product.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.product.count();

    return {
      products: products.map((p: any) => ({
        ...p,
        price: p.price.toNumber(),
      })),
      total,
    };
  }

  async getProducts(category?: string, skip: number = 0, take: number = 1000) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.product.count({
      where: { isActive: true, ...(category && { category }) },
    });

    return {
      products: products.map((p: any) => ({
        ...p,
        price: p.price.toNumber(),
      })),
      total,
    };
  }

  async getProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  async updateProduct(productId: string, data: any) {
    if (data.imageUrl) {
      data.imageUrl = await this.processImageUrls(data.imageUrl);
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        ...(data.price && { price: new Decimal(data.price) }),
      },
    });

    return {
      ...product,
      price: product.price.toNumber(),
    };
  }

  async deactivateProduct(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }
}
