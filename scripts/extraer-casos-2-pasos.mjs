// scripts/extraer-casos-2-pasos.mjs
import fs from 'fs/promises';
import JSON5 from 'json5';

async function main() {
  const content = await fs.readFile('prisma/cases.json5', 'utf-8');
  const casos = JSON5.parse(content);
  
  const casosCon2Pasos = casos.filter(c => c.pasos?.length === 2);
  
  console.log(`\n📋 CASOS CON SOLO 2 PASOS (${casosCon2Pasos.length}):\n`);
  
  casosCon2Pasos.forEach((caso, idx) => {
    console.log(`${idx + 1}. ID: ${caso.id}`);
    console.log(`   Título: ${caso.titulo}`);
    console.log(`   Módulo: ${caso.modulo}`);
    console.log(`   Pasos encontrados: ${caso.pasos.length}`);
    console.log(`   IDs de pasos: ${caso.pasos.map(p => p.id).join(', ')}`);
    console.log('');
  });
  
  // Guardar IDs en un archivo para referencia
  const ids = casosCon2Pasos.map(c => c.id);
  await fs.writeFile(
    'casos-incompletos-ids.txt', 
    ids.join('\n'),
    'utf-8'
  );
  
  console.log(`✅ IDs guardados en: casos-incompletos-ids.txt\n`);
}

main().catch(console.error);
