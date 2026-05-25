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
  'kurtis',
];

// Keywords to identify men's products (more specific)
const menKeywords = [
  'men',
  'mens',
  'boys',
];

function classifyGender(productName: string): string {
  const name = productName.toLowerCase();

  // Check for women keywords FIRST (more specific)
  for (const keyword of womenKeywords) {
    if (name.includes(keyword)) {
      return 'Female';
    }
  }

  // Check for men keywords
  for (const keyword of menKeywords) {
    if (name.includes(keyword)) {
      return 'Male';
    }
  }

  // Default to Male for unisex/unspecified items
  return 'Male';
}

function parsePrice(priceStr: any): number {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
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

async function importProducts(filePath: string) {
  try {
    console.log(`\n📂 Reading file: ${path.basename(filePath)}`);

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<ProductRow>(worksheet);

    console.log(`✅ Found ${rawData.length} products in Excel file\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process in batches for better performance
    const batchSize = 10;
    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const productName = row['Product Name']?.trim();
          const imageUrl = row['Image URL(s)']?.trim();
          const priceStr = row['Prices'];
          const description = row['Description']?.trim() || '';
          const stockStr = row['Stock Quantity'];

          // Skip if missing critical data
          if (!productName || !imageUrl) {
            skipped++;
            continue;
          }

          // Classify gender based on product name
          const gender = classifyGender(productName);

          // Parse price
          const price = parsePrice(priceStr);
          if (price <= 0) {
            skipped++;
            continue;
          }

          // Parse stock
          const stockQuantity = parseStockQuantity(stockStr);

          // Check if product already exists
          const existingProduct = await prisma.product.findFirst({
            where: {
              name: productName,
            },
          });

          if (existingProduct) {
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
              type: 'PHYSICAL',
              imageUrl: imageUrl,
              stockQuantity: Math.max(0, stockQuantity),
              gender: gender,
              isActive: true,
            },
          });

          console.log(
            `✅ [${imported + 1}] ${product.name.substring(0, 40).padEnd(42)} (${gender.padEnd(6)}) - ₹${product.price}`,
          );
          imported++;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          if (!errorMsg.includes('database server')) {
            console.error(`❌ Error: ${errorMsg.substring(0, 60)}`);
            errors++;
          } else {
            // Database error - don't increment error count, just skip
            skipped++;
          }
        }
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 Import Summary for ${path.basename(filePath)}`);
    console.log(`${'='.repeat(70)}`);
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped:  ${skipped}`);
    console.log(`❌ Errors:   ${errors}`);
    console.log(`${'='.repeat(70)}\n`);

    return imported;
  } catch (err) {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: npx ts-node scripts/import-products-bulk.ts <file1.xlsx> [file2.xlsx ...]');
    process.exit(1);
  }

  let totalImported = 0;

  try {
    for (const fileArg of args) {
      const filePath = path.resolve(fileArg);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }
      const imported = await importProducts(filePath);
      totalImported += imported;
    }

    console.log(`\n🎉 Total products imported: ${totalImported}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
