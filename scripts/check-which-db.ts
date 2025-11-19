// scripts/check-which-db.ts
import { config } from 'dotenv';
config();

import { prisma } from '../lib/prisma';

async function main() {
  console.log('\n📊 Verificando conexión a base de datos...\n');
  console.log('DATABASE_URL conectada a:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
  
  const users = await prisma.user.findMany();
  console.log(`\n👥 Usuarios encontrados: ${users.length}\n`);
  
  if (users.length > 0) {
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
  } else {
    console.log('  ⚠️  No hay usuarios en esta base de datos');
  }
  
  const cases = await prisma.case.count();
  console.log(`\n📋 Casos clínicos: ${cases}`);
  
  console.log('\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
