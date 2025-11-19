// scripts/eliminar-casos-incompletos.mjs
import fs from 'fs/promises';
import JSON5 from 'json5';

const idsAEliminar = [
  'antico-01-adolescente-primera-consulta',
  'antico-02-fumadora-mayor-35',
  'antico-03-posparto-lactancia',
  'antico-04-ae-lng',
  'antico-05-migraña-con-aura',
  'antico-06-posaborto-primero-trimestre',
  'antico-07-adolescente-dmpa',
  'antico-08-diu-sangrado-abundante',
  'antico-09-its-y-diu',
  'antico-10-usuario-despistado-aco',
  'its-01-uretritis-masculina',
  'its-02-ulcera-genital',
  'its-03-vaginitis',
  'its-04-screening-asintomatico',
  'its-05-its-y-embarazo',
  'cons-01-confidencialidad-madre-presente',
  'cons-02-ae-y-miedo-a-padres',
  'cons-03-diversidad-sexual',
  'cons-04-baja-adherencia-aco-culpa',
  'cons-05-adolescente-migrante',
];

async function main() {
  console.log('\n🗑️  Eliminando casos incompletos de cases.json5...\n');
  
  const content = await fs.readFile('prisma/cases.json5', 'utf-8');
  const casos = JSON5.parse(content);
  
  const casosAnteriores = casos.length;
  const casosFiltrados = casos.filter(c => !idsAEliminar.includes(c.id));
  const eliminados = casosAnteriores - casosFiltrados.length;
  
  console.log(`Total casos antes: ${casosAnteriores}`);
  console.log(`Casos eliminados: ${eliminados}`);
  console.log(`Total casos después: ${casosFiltrados.length}\n`);
  
  // Guardar archivo actualizado
  const json5Output = JSON.stringify(casosFiltrados, null, 2);
  await fs.writeFile('prisma/cases.json5', json5Output, 'utf-8');
  
  console.log('✅ Archivo cases.json5 actualizado\n');
  console.log('📝 Ahora puedes agregar los casos corregidos y ejecutar: npm run seed:cases\n');
}

main().catch(console.error);
