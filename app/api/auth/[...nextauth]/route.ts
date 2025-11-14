// app/api/auth/[...nextauth]/route.ts
// VERSIÓN FINAL: PROXY ROBUSTO Y EXPLICITO

// Importa los handlers del motor Auth.js
import { handlers } from '@/auth'; 
import { NextRequest } from 'next/server'; // Importa el tipo NextRequest para claridad

// 1. Exporta la función GET
//    Esta función llama al handler GET real del motor Auth.js.
export async function GET(req: NextRequest) {
  // @ts-ignore — A veces el tipado estricto de V5 aún da problemas aquí, 
  // pero la ejecución funciona. Lo ignoramos por robustez.
  return handlers.GET(req); 
}

// 2. Exporta la función POST
//    Esta función llama al handler POST real del motor Auth.js.
export async function POST(req: NextRequest) {
  // @ts-ignore
  return handlers.POST(req); 
}