import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClerkGuard } from '../common/clerk.guard';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '../common/dtos';
import { AdminGuard } from '../common/admin.guard';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getProducts(
    @Query('category') category?: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '100',
  ) {
    return this.productService.getProducts(category, parseInt(skip), parseInt(take));
  }

  @Get('all')
  @UseGuards(ClerkGuard, AdminGuard)
  async getAllProducts(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '50',
  ) {
    return this.productService.getAllProducts(parseInt(skip), parseInt(take));
  }

  @Get(':id')
  async getProduct(@Param('id') productId: string) {
    return this.productService.getProduct(productId);
  }

  @Post()
  @UseGuards(ClerkGuard, AdminGuard)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(
      dto.name,
      dto.description || '',
      dto.price,
      dto.category,
      dto.type,
      dto.imageUrl,
      dto.stockQuantity || 0,
      dto.gender,
      dto.sizes,
    );
  }

  @Put(':id')
  @UseGuards(ClerkGuard, AdminGuard)
  async updateProduct(@Param('id') productId: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(productId, dto);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard, AdminGuard)
  async deactivateProduct(@Param('id') productId: string) {
    return this.productService.deactivateProduct(productId);
  }
}
