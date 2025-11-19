// scripts/analizar-casos-incompletos.mjs
import fs from 'fs/promises';
import JSON5 from 'json5';

async function main() {
  console.log('\n🔍 Analizando casos con menos de 5 preguntas...\n');
  
  const content = await fs.readFile('prisma/cases.json5', 'utf-8');
  const casos = JSON5.parse(content);
  
  const casosIncompletos = [];
  const resumen = {
    total: casos.length,
    con5Pasos: 0,
    con4Pasos: 0,
    con3Pasos: 0,
    con2Pasos: 0,
    con1Paso: 0,
  };
  
  casos.forEach(caso => {
    const numPasos = caso.pasos?.length || 0;
    
    if (numPasos === 5) resumen.con5Pasos++;
    else if (numPasos === 4) resumen.con4Pasos++;
    else if (numPasos === 3) resumen.con3Pasos++;
    else if (numPasos === 2) resumen.con2Pasos++;
    else if (numPasos === 1) resumen.con1Paso++;
    
    if (numPasos < 5) {
      casosIncompletos.push({
        id: caso.id,
        titulo: caso.titulo,
        modulo: caso.modulo,
        pasos: numPasos,
      });
    }
  });
  
  console.log('📊 RESUMEN:');
  console.log(`   Total de casos: ${resumen.total}`);
  console.log(`   Con 5 pasos (completos): ${resumen.con5Pasos}`);
  console.log(`   Con 4 pasos: ${resumen.con4Pasos}`);
  console.log(`   Con 3 pasos: ${resumen.con3Pasos}`);
  console.log(`   Con 2 pasos: ${resumen.con2Pasos}`);
  console.log(`   Con 1 paso: ${resumen.con1Paso}`);
  
  if (casosIncompletos.length > 0) {
    console.log(`\n⚠️  CASOS INCOMPLETOS (${casosIncompletos.length}):\n`);
    
    casosIncompletos.forEach((caso, idx) => {
      console.log(`${idx + 1}. ${caso.id}`);
      console.log(`   Título: ${caso.titulo}`);
      console.log(`   Módulo: ${caso.modulo}`);
      console.log(`   Pasos: ${caso.pasos}/5`);
      console.log('');
    });
  } else {
    console.log('\n✅ Todos los casos tienen 5 pasos!\n');
  }
}

main().catch(console.error);
