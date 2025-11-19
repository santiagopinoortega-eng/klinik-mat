// scripts/check-env.mjs
import { config } from 'dotenv';
import { existsSync } from 'fs';

// Carga de entorno (si existe localmente)
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

// Variables requeridas para el proyecto con Clerk
const required = [
  "DATABASE_URL", // Conexión a Neon con pooler
  "CLERK_SECRET_KEY", // Clave secreta de Clerk
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", // Clave pública de Clerk
];

// Variables recomendadas
const recommended = [
  "CLERK_WEBHOOK_SECRET", // Para sincronización de usuarios
];

// Verificar las variables requeridas
const missingRequired = required.filter(k => !process.env[k]);

if (missingRequired.length) {
  console.error(`\n❌ ERROR CRÍTICO: Faltan variables esenciales: ${missingRequired.join(", ")}`);
  console.error("   La compilación se detiene. Asegúrate de que las tienes en .env.local o Vercel.");
  process.exit(1);
}

// Verificar las variables recomendadas (no detiene el build, solo advierte)
const missingRecommended = recommended.filter(k => !process.env[k]);

if (missingRecommended.length) {
  console.warn(`\n⚠️ Advertencia: Faltan variables recomendadas: ${missingRecommended.join(", ")}`);
  console.warn("   El webhook de Clerk no funcionará sin CLERK_WEBHOOK_SECRET.");
}

console.log("\n✅ Variables de entorno OK");