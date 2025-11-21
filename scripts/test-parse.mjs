#!/usr/bin/env node
import { readFileSync } from 'fs';
import JSON5 from 'json5';

try {
  console.log('📖 Leyendo cases.json5...');
  const data = readFileSync('./prisma/cases.json5', 'utf-8');
  console.log(`✓ Archivo leído: ${data.length} caracteres`);
  
  console.log('\n🔍 Parseando JSON5...');
  const cases = JSON5.parse(data);
  console.log(`✓ Parseo exitoso: ${cases.length} casos`);
  
  console.log('\n📊 Casos por módulo:');
  const byModule = cases.reduce((acc, c) => {
    acc[c.modulo] = (acc[c.modulo] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byModule).forEach(([mod, count]) => {
    console.log(`  ${mod}: ${count} casos`);
  });
  
  console.log('\n✅ El archivo JSON5 es válido y está listo para seed!\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.lineNumber) {
    console.error(`   Línea: ${error.lineNumber}, Columna: ${error.columnNumber}`);
  }
  process.exit(1);
}
