// scripts/create-admin-main.ts
import { config } from 'dotenv';
config();

import { prisma } from '../lib/prisma';

async function main() {
  const userId = 'user_35fwnU2nlzNFqfInIdQIJ2RIfr9';
  const email = 'santiagopinoortega@gmail.com';
  
  console.log('\n📝 Creando usuario ADMIN en base de datos MAIN...');
  console.log(`   Database: ep-red-leaf (MAIN)`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${email}\n`);
  
  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: 'Santiago Pino Ortega',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    
    console.log('✅ Usuario ADMIN creado exitosamente!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario ya existe, actualizando a ADMIN...');
      
      const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      
      console.log('✅ Actualizado a rol ADMIN\n');
    } else {
      console.error('❌ Error:', error.message, '\n');
      throw error;
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
