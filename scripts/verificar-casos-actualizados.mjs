// scripts/verificar-casos-actualizados.mjs
import fs from 'fs/promises';
import JSON5 from 'json5';

async function main() {
  const idsIncompletos = [
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

  const content = await fs.readFile('prisma/cases.json5', 'utf-8');
  const casos = JSON5.parse(content);
  
  console.log('\n✅ Verificando actualización de los 20 casos:\n');
  
  let todosCompletos = true;
  
  for (const id of idsIncompletos) {
    const caso = casos.find(c => c.id === id);
    if (!caso) {
      console.log(`❌ ${id} - NO ENCONTRADO`);
      todosCompletos = false;
      continue;
    }
    
    const numPasos = caso.pasos?.length || 0;
    if (numPasos === 5) {
      console.log(`✅ ${id} - ${numPasos} pasos`);
    } else {
      console.log(`⚠️  ${id} - ${numPasos} pasos (incompleto)`);
      todosCompletos = false;
    }
  }
  
  if (todosCompletos) {
    console.log('\n🎉 ¡Todos los casos están completos con 5 pasos!\n');
  } else {
    console.log('\n⚠️  Algunos casos aún están incompletos\n');
  }
}

main().catch(console.error);
