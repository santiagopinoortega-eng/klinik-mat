// scripts/generar-casos-desde-csv.mjs
/**
 * Genera casos en formato JSON5 desde un archivo CSV
 * 
 * Formato CSV esperado:
 * id,modulo,dificultad,titulo,vigneta,p1_pregunta,p1_correcta,p1_exp_correcta,...
 */

import fs from 'fs/promises';
import csv from 'csv-parser';
import { createReadStream } from 'fs';

async function generarCasosDesdeCSV(archivoCSV) {
  const casos = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(archivoCSV)
      .pipe(csv())
      .on('data', (row) => {
        // Adaptar según tu estructura CSV
        const caso = {
          id: row.id,
          modulo: row.modulo,
          dificultad: row.dificultad,
          titulo: row.titulo,
          vigneta: row.vigneta,
          pasos: generarPasos(row),
          referencias: row.referencias ? row.referencias.split('|') : []
        };
        casos.push(caso);
      })
      .on('end', () => {
        resolve(casos);
      })
      .on('error', reject);
  });
}

function generarPasos(row) {
  const pasos = [];
  const numPasos = row.dificultad === 'Baja' ? 5 : row.dificultad === 'Media' ? 6 : 7;
  
  for (let i = 1; i <= numPasos; i++) {
    const tipo = row[`p${i}_tipo`] || 'mcq';
    
    if (tipo === 'mcq') {
      pasos.push({
        id: `p${i}`,
        tipo: 'mcq',
        enunciado: row[`p${i}_pregunta`],
        opciones: [
          {
            id: 'a',
            texto: row[`p${i}_opcion_a`],
            esCorrecta: row[`p${i}_correcta`] === 'a',
            explicacion: row[`p${i}_exp_a`]
          },
          {
            id: 'b',
            texto: row[`p${i}_opcion_b`],
            esCorrecta: row[`p${i}_correcta`] === 'b',
            explicacion: row[`p${i}_exp_b`]
          },
          {
            id: 'c',
            texto: row[`p${i}_opcion_c`],
            esCorrecta: row[`p${i}_correcta`] === 'c',
            explicacion: row[`p${i}_exp_c`]
          },
          {
            id: 'd',
            texto: row[`p${i}_opcion_d`],
            esCorrecta: row[`p${i}_correcta`] === 'd',
            explicacion: row[`p${i}_exp_d`]
          }
        ],
        feedbackDocente: row[`p${i}_feedback_docente`]
      });
    } else {
      pasos.push({
        id: `p${i}`,
        tipo: 'short',
        enunciado: row[`p${i}_pregunta`],
        guia: row[`p${i}_guia`],
        feedbackDocente: row[`p${i}_feedback_docente`]
      });
    }
  }
  
  return pasos;
}

// Uso
const casos = await generarCasosDesdeCSV('casos-nuevos.csv');
const json5Output = JSON.stringify(casos, null, 2);
await fs.writeFile('casos-generados.json5', json5Output, 'utf-8');
console.log(`✅ ${casos.length} casos generados en casos-generados.json5`);
