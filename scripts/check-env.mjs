// scripts/check-env.mjs
<<<<<<< HEAD
import { config } from 'dotenv';
import { existsSync } from 'fs';

// Carga de entorno (si existe localmente)
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

// 1. Definir los requerimientos CLAVE
const required = [
  "DATABASE_URL", // ¡ESENCIAL! Sin esto no hay DB.
  // Podrías añadir NEXTAUTH_SECRET si ya lo estás usando para autenticación
];

// 2. Definir los requerimientos CONDICIONALES (Recomendados para escalabilidad)
// No hacemos fallar el build si faltan, pero advertimos.
const recommended = [
  "DATABASE_URL_READONLY", 
];

// --- Lógica de Validación ---

// Verificar las variables requeridas
const missingRequired = required.filter(k => !process.env[k]);

if (missingRequired.length) {
  console.error(`\n❌ ERROR CRÍTICO: Faltan variables esenciales: ${missingRequired.join(", ")}`);
  console.error("   La compilación se detiene. Asegúrate de que las tienes en .env.local o Vercel Secrets.");
  process.exit(1);
}

// Verificar las variables recomendadas (no detiene el build, solo advierte)
const missingRecommended = recommended.filter(k => !process.env[k]);

if (missingRecommended.length) {
  console.warn(`\n⚠️ Advertencia: Faltan variables recomendadas: ${missingRecommended.join(", ")}`);
  console.warn("   Considera definir DATABASE_URL_READONLY para mejorar la escalabilidad en producción (prismaRO usará DATABASE_URL como fallback).");
}

console.log("\n✅ Variables de entorno OK");
=======
const required = ["DATABASE_URL"];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(", ")}`);
  console.error("Crea .env (o define Codespaces/Vercel secrets). Ejemplo en .env.example");
  process.exit(1);
} else {
  console.log("✅ Variables de entorno OK");
}
>>>>>>> 68bff7b924ecf91be37b4416b61edb52aac487e6
