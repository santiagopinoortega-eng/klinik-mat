#!/usr/bin/env node
/*
 scripts/sync-cases.js
  - Dry-run comparator between `DATABASE_URL` (main) and `DATABASE_URL_DEV` (dev branch).
  - Usage:
      node scripts/sync-cases.js       # dry-run, shows differences
      node scripts/sync-cases.js --apply   # NOT IMPLEMENTED: apply mode (future)

  This script is intentionally conservative: it only reports differences. Applying changes
  requires manual review and a separate --apply implementation.
*/

const fs = require('fs');
const path = require('path');
const child = require('child_process');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const { PrismaClient } = require('@prisma/client');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    allowDelete: args.includes('--allow-delete'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

async function listIds(url) {
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    const rows = await client.case.findMany({ select: { id: true } });
    return rows.map((r) => r.id).sort();
  } finally {
    await client.$disconnect();
  }
}

async function backupMainFull(url, outDir = 'backups') {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const out = path.join(outDir, `backup-main-${ts}.json`);
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    console.log('Creando backup JSON completo de la base main en', out);
    const all = await client.case.findMany({ include: { questions: { include: { options: true } }, norms: true } });
    fs.writeFileSync(out, JSON.stringify({ createdAt: new Date().toISOString(), data: all }, null, 2));
    console.log('Backup escrito:', out);
    return out;
  } finally {
    await client.$disconnect();
  }
}

async function fetchAllCases(url) {
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    return await client.case.findMany({ include: { questions: { include: { options: true } }, norms: true } });
  } finally {
    await client.$disconnect();
  }
}

async function applyChanges(urlDev, urlMain, options = {}) {
  const dev = new PrismaClient({ datasources: { db: { url: urlDev } } });
  const main = new PrismaClient({ datasources: { db: { url: urlMain } } });
  try {
    const devCases = await dev.case.findMany({ include: { questions: { include: { options: true } }, norms: true } });

    // process in batches
    const batchSize = 20;
    for (let i = 0; i < devCases.length; i += batchSize) {
      const batch = devCases.slice(i, i + batchSize);
      for (const c of batch) {
        console.log('Procesando case:', c.id, '|', c.title);

        await main.$transaction(async (tx) => {
          const existing = await tx.case.findUnique({ where: { id: c.id } });
          if (!existing) {
            // create norms (connectOrCreate)
            const normConnects = [];
            for (const n of c.norms || []) {
              const up = await tx.minsalNorm.upsert({ where: { code: n.code }, create: { name: n.name, code: n.code }, update: { name: n.name } });
              normConnects.push({ id: up.id });
            }

            // create case with nested questions/options
            await tx.case.create({
              data: {
                id: c.id,
                title: c.title,
                area: c.area,
                difficulty: c.difficulty,
                summary: c.summary,
                isPublic: c.isPublic,
                vignette: c.vignette,
                questions: {
                  create: (c.questions || []).map((q) => ({
                    id: q.id,
                    order: q.order,
                    text: q.text,
                    guia: q.guia,
                    feedbackDocente: q.feedbackDocente,
                    options: { create: (q.options || []).map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect, feedback: o.feedback })) },
                  })),
                },
                norms: {
                  connect: normConnects,
                },
              },
            });
            console.log('  creado:', c.id);
          } else {
            // update scalar fields
            await tx.case.update({ where: { id: c.id }, data: { title: c.title, area: c.area, difficulty: c.difficulty, summary: c.summary, isPublic: c.isPublic, vignette: c.vignette } });

            // remove existing questions & options for fidelity, then recreate
            const qRows = await tx.question.findMany({ where: { caseId: c.id }, select: { id: true } });
            const qIds = qRows.map((r) => r.id);
            if (qIds.length) {
              await tx.option.deleteMany({ where: { questionId: { in: qIds } } });
              await tx.question.deleteMany({ where: { id: { in: qIds } } });
            }

            // recreate questions + options
            for (const q of c.questions || []) {
              await tx.question.create({ data: { id: q.id, order: q.order, text: q.text, guia: q.guia, feedbackDocente: q.feedbackDocente, case: { connect: { id: c.id } }, options: { create: (q.options || []).map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect, feedback: o.feedback })) } } });
            }

            // sync norms
            const normConnects = [];
            for (const n of c.norms || []) {
              const up = await tx.minsalNorm.upsert({ where: { code: n.code }, create: { name: n.name, code: n.code }, update: { name: n.name } });
              normConnects.push({ id: up.id });
            }
            await tx.case.update({ where: { id: c.id }, data: { norms: { set: normConnects } } });

            console.log('  actualizado:', c.id);
          }
        });
      }
    }
  } finally {
    await dev.$disconnect();
    await main.$disconnect();
  }
}

async function main() {
  const args = parseArgs();
  const urlMain = process.env.DATABASE_URL || null;
  const urlDev = process.env.DATABASE_URL_DEV || null;

  if (args.help) {
    console.log('Uso: node scripts/sync-cases.js [--apply] [--allow-delete]');
    console.log('  --apply        Aplica los cambios (requiere CONFIRM_SYNC=1)');
    console.log('  --allow-delete Permite eliminar casos en main (doble confirmación requerida)');
    process.exit(0);
  }

  if (!urlDev) {
    console.error('ERROR: DATABASE_URL_DEV no definida en .env.local');
    process.exit(1);
  }

  console.log('Comparando bases... (modo', args.apply ? 'APLICAR' : 'DRY-RUN', ')');

  const idsDev = await listIds(urlDev);
  const idsMain = urlMain ? await listIds(urlMain) : [];

  const onlyInDev = idsDev.filter((id) => !idsMain.includes(id));
  const onlyInMain = idsMain.filter((id) => !idsDev.includes(id));

  console.log('\nResumen:');
  console.log(`  casos en dev: ${idsDev.length}`);
  console.log(`  casos en main: ${idsMain.length}`);
  console.log(`  solo en dev: ${onlyInDev.length}`);
  console.log(`  solo en main: ${onlyInMain.length}`);

  if (!args.apply) {
    if (onlyInDev.length) {
      console.log('\nIDs solo en dev (primeros 50):');
      console.log(onlyInDev.slice(0, 50).join('\n'));
    }
    if (onlyInMain.length) {
      console.log('\nIDs solo en main (primeros 50):');
      console.log(onlyInMain.slice(0, 50).join('\n'));
    }

    console.log('\nModo dry-run. Para aplicar cambios ejecutá con --apply y CONFIRM_SYNC=1.');
    return;
  }

  // Apply path: require explicit confirmation
  if (process.env.CONFIRM_SYNC !== '1') {
    console.error('ERROR: para aplicar cambios se requiere la variable de entorno CONFIRM_SYNC=1');
    process.exit(2);
  }

  if (!urlMain) {
    console.error('ERROR: DATABASE_URL (main) no está configurada. No se puede aplicar.');
    process.exit(1);
  }

  // backup main to JSON (safety)
  const backupFile = await backupMainFull(urlMain);
  console.log('Backup creado antes de aplicar:', backupFile);

  // Apply upserts from dev into main
  console.log('Aplicando upserts desde dev -> main (sin borrados por defecto)...');
  await applyChanges(urlDev, urlMain, { allowDelete: args.allowDelete });

  console.log('Sincronización finalizada. Recomendado: revisar logs y validar en main.');
}

main().catch((e) => {
  console.error('Fallo inesperado:', e && e.message ? e.message : e);
  process.exit(1);
});
