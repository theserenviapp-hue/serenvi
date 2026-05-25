import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductRow {
  'Product Name': string;
  'Prices': string;
  'Category': string;
  'Type': string;
  'Image URL(s)': string;
  'Stock Quantity': number | string;
  'Description': string;
  'Product Buy Link': string;
  'Size/Color Variants': string;
  'Gender'?: string;
}

// Keywords to identify women's products
const womenKeywords = [
  'women',
  'womens',
  'ladies',
  'girls',
  'female',
  'saree',
  'dupatta',
  'kurta',
  'salwar',
  'lehenga',
  'ghagra',
  'anarkali',
  'salwar kameez',
  'kurtis',
  'top',
  'dress',
  'skirt',
  'palazzo',
  'heels',
  'sandals',
  'handbag',
  'purse',
  'makeup',
  'jewelry set',
  'mangalsutra',
];

// Keywords to identify men's products
const menKeywords = [
  'men',
  'mens',
  'boys',
  'male',
  'shirt',
  'tshirt',
  'trouser',
  'pant',
  'shorts',
  'jeans',
  'dhoti',
  'lungi',
  'kurta',
  'sherwani',
  'blazer',
  'waistcoat',
];

function classifyGender(productName: string, imageUrl: string): string {
  const name = productName.toLowerCase();
  const url = imageUrl?.toLowerCase() || '';

  // Check for explicit women keywords
  for (const keyword of womenKeywords) {
    if (name.includes(keyword) || url.includes(keyword)) {
      return 'FEMALE';
    }
  }

  // Check for explicit men keywords
  for (const keyword of menKeywords) {
    if (name.includes(keyword) || url.includes(keyword)) {
      return 'MALE';
    }
  }

  // Fallback: assume unisex items are male (for safety)
  return 'MALE';
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function parseStockQuantity(stock: any): number {
  if (typeof stock === 'number') return stock;
  if (typeof stock === 'string') {
    const parsed = parseInt(stock, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function determineProductType(category: string): string {
  const cat = category?.toLowerCase() || '';
  if (
    cat.includes('clothing') ||
    cat.includes('shirt') ||
    cat.includes('tshirt') ||
    cat.includes('pant') ||
    cat.includes('saree')
  ) {
    return 'PHYSICAL';
  }
  return 'PHYSICAL'; // Default to PHYSICAL
}

async function importProducts(filePath: string) {
  try {
    console.log(`📂 Reading file: ${filePath}`);

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<ProductRow>(worksheet);

    console.log(`✅ Found ${rawData.length} products in Excel file`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rawData) {
      try {
        const productName = row['Product Name']?.trim();
        const imageUrl = row['Image URL(s)']?.trim();
        const priceStr = row['Prices'];
        const description = row['Description']?.trim() || '';
        const stockStr = row['Stock Quantity'];

        // Skip if missing critical data
        if (!productName || !imageUrl) {
          console.warn(`⚠️  Skipping product: missing name or image`);
          skipped++;
          continue;
        }

        // Classify gender based on product name and image
        const gender = classifyGender(productName, imageUrl);

        // Parse price
        const price = parsePrice(priceStr);
        if (price <= 0) {
          console.warn(`⚠️  Skipping "${productName}": invalid price`);
          skipped++;
          continue;
        }

        // Parse stock
        const stockQuantity = parseStockQuantity(stockStr);

        // Determine type
        const type = determineProductType(row['Category']);

        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: productName,
          },
        });

        if (existingProduct) {
          console.log(`⏭️  Product exists: "${productName}"`);
          skipped++;
          continue;
        }

        // Create product
        const product = await prisma.product.create({
          data: {
            name: productName,
            description: description,
            price: parseFloat(price.toFixed(2)),
            category: row['Category']?.trim() || 'Clothing',
            type: type,
            imageUrl: imageUrl,
            stockQuantity: stockQuantity,
            gender: gender,
            isActive: true,
          },
        });

        console.log(
          `✅ Created: "${product.name}" (${gender}) - ₹${product.price}`,
        );
        imported++;
      } catch (err) {
        console.error(`❌ Error processing row:`, err instanceof Error ? err.message : err);
        errors++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    await prisma.$disconnect();
  } catch (err) {
    console.error('Fatal error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx ts-node scripts/import-products-excel.ts <filepath>');
  console.log('Example: npx ts-node scripts/import-products-excel.ts data/products.xlsx');
  process.exit(1);
}

const filePath = path.resolve(args[0]);
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

importProducts(filePath);
