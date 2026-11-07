const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, '../reference-data/07_seed_80_products.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Parse categories
const catRegex = /upsert_category\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\);/g;
let catMatch;
const categories = [];
while ((catMatch = catRegex.exec(content)) !== null) {
  categories.push({
    categoryId: parseInt(catMatch[1], 10),
    name: catMatch[2].trim(),
    description: catMatch[3].trim(),
  });
}

// Parse products
const prodRegex = /upsert_product\(\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*([\d.]+)\s*,\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*(?:,\s*(\d+)\s*)?\);/g;
let prodMatch;
const products = [];
let idx = 1;
while ((prodMatch = prodRegex.exec(content)) !== null) {
  products.push({
    productId: idx++,
    categoryId: parseInt(prodMatch[1], 10),
    name: prodMatch[2].replace(/''/g, "'").trim(),
    description: prodMatch[3].replace(/''/g, "'").trim(),
    price: parseFloat(prodMatch[4]),
    stockQty: parseInt(prodMatch[5], 10),
    imagePath: prodMatch[6].replace(/''/g, "'").trim(),
    isActive: prodMatch[7] === undefined ? true : prodMatch[7] === '1',
  });
}

console.log('Categories parsed:', categories.length);
console.log('Products parsed:', products.length);

fs.writeFileSync(
  path.join(__dirname, 'seedData.json'),
  JSON.stringify({ categories, products }, null, 2),
  'utf8'
);
console.log('Saved to database/seedData.json');
