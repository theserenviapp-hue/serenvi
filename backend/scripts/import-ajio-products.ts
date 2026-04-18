/**
 * Bulk import Ajio products from CSV into Product table.
 *
 * Run:  npm run import:products
 * Idempotent: skips rows whose name already exists.
 *
 * CSV columns expected:
 *   Product Name, Prices, Category, Type, Image URL(s), Stock Quantity,
 *   Description, Product Buy Link, Size/Color Variants, Gender
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
  'Product Name': string;
  Prices?: string;
  'New Prices'?: string;
  Category: string;
  Type: string;
  'Image URL(s)': string;
  'Stock Quantity': string;
  Description: string;
  'Product Buy Link': string;
  'Size/Color Variants': string;
  Gender: string;
}

function parsePrice(raw: string): number {
  // "₹799" -> 799
  const cleaned = (raw || '').replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseInteger(raw: string): number {
  const n = parseInt((raw || '').replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function mapGender(raw: string): string {
  const v = (raw || '').toLowerCase().trim();
  if (v === 'men' || v === 'male') return 'Male';
  if (v === 'women' || v === 'female') return 'Female';
  if (v === 'kids' || v === 'children') return 'Kids';
  return 'Unisex';
}

/** The CSV column "Size/Color Variants" actually contains colour strings
 *  ("offwhite", "bluebeige") — not sizes. Map to a sensible size set based
 *  on category + gender so the shop UI can render a proper size picker. */
function defaultSizes(category: string, gender: string): string | null {
  const cat = (category || '').toLowerCase();
  if (/foot|shoe|sandal|sneaker|heel|loafer|boot/.test(cat)) {
    return /^m/i.test(gender) ? '7, 8, 9, 10, 11' : '4, 5, 6, 7, 8';
  }
  if (/home|living|kitchen|decor|lamp|bag|wallet|accessor|jewel|watch|beauty|cosmet/.test(cat)) {
    return null;
  }
  return /^m/i.test(gender) ? 'S, M, L, XL, XXL' : 'S, M, L, XL';
}

async function main() {
  // Allow passing CSV file via CLI arg, default to ajio_products.csv
  const fileName = process.argv[2] || 'ajio_products.csv';
  const csvPath = path.isAbsolute(fileName)
    ? fileName
    : path.join(__dirname, '..', 'data', fileName);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }
  console.log(`📂 Reading: ${csvPath}`);

  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_quotes: true,
  });

  console.log(`📦 Parsed ${rows.length} rows from CSV`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const name = row['Product Name']?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const price = parsePrice(row.Prices || row['New Prices'] || '');
    if (price <= 0) {
      console.warn(`⚠️  Skipping "${name}" — invalid price`);
      skipped++;
      continue;
    }

    try {
      const existing = await prisma.product.findFirst({ where: { name } });
      if (existing) {
        skipped++;
        continue;
      }

      // Map CSV's "Category" (Clothing) + "Type" (Socks/Earrings/etc) into
      // the Product.category field. Product.type is reserved for PHYSICAL/DIGITAL.
      const combinedCategory = row.Type
        ? `${row.Category} - ${row.Type}`.trim()
        : row.Category || 'General';

      const gender = mapGender(row.Gender);
      await prisma.product.create({
        data: {
          name,
          description: row.Description || null,
          price: new Prisma.Decimal(price),
          category: combinedCategory,
          type: 'PHYSICAL',
          imageUrl: row['Image URL(s)'] || null,
          stockQuantity: parseInteger(row['Stock Quantity']),
          gender,
          // NOTE: CSV "Size/Color Variants" holds colours, not sizes. Use
          // category+gender defaults instead.
          sizes: defaultSizes(combinedCategory, gender),
          isActive: true,
        },
      });
      created++;
      if (created % 25 === 0) console.log(`  ...${created} created`);
    } catch (err: any) {
      failed++;
      console.error(`❌ ${name}: ${err.message}`);
    }
  }

  const total = await prisma.product.count();
  console.log(`\n✅ Done. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`📊 Total products in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
