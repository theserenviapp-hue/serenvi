import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Row {
  'Product Name': string;
  'Image URL(s)': string;
}

async function main() {
  const files = ['ajio_products.csv', 'ajio_with_gender.csv'];
  const nameToUrl = new Map<string, string>();

  for (const f of files) {
    const p = path.join(__dirname, '..', 'data', f);
    const raw = fs.readFileSync(p, 'utf8');
    const rows: Row[] = parse(raw, {
      columns: true, skip_empty_lines: true, trim: true, bom: true, relax_quotes: true,
    });
    for (const r of rows) {
      const name = r['Product Name']?.trim();
      const url = r['Image URL(s)']?.trim();
      if (name && url && !nameToUrl.has(name)) nameToUrl.set(name, url);
    }
  }
  console.log(`Loaded ${nameToUrl.size} name→url mappings`);

  const products = await prisma.product.findMany({
    where: { name: { contains: 'Lulu', mode: 'insensitive' } },
    select: { id: true, name: true, imageUrl: true },
  });

  let fixed = 0;
  for (const p of products) {
    const correct = nameToUrl.get(p.name);
    if (correct && correct !== p.imageUrl) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: correct } });
      console.log(`✓ ${p.name}\n  OLD: ${p.imageUrl}\n  NEW: ${correct}`);
      fixed++;
    }
  }
  console.log(`\nFixed ${fixed} / ${products.length} Lulu products`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
