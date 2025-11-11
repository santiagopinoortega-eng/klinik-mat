// app/api/casos/[id]/answer/route.ts
// Lógica para verificar la opción seleccionada.

import { NextResponse } from 'next/server';
import { getOptionDetails } from '@/services/caso.service';

// Manejador POST para verificar la respuesta del usuario.
export async function POST(
  request: Request,
  // Aquí usamos 'id' para ser consistentes con la carpeta [id]
  { params }: { params: { id: string } } 
) {
  try {
    const { optionId } = await request.json(); 

    if (!optionId || typeof optionId !== 'string') {
      return NextResponse.json(
        { message: 'Falta un ID de opción válido (optionId).' },
        { status: 400 }
      );
    }

    // 1. Obtener los detalles completos y seguros de la opción
    const option = await getOptionDetails(optionId);

    if (!option) {
      return NextResponse.json(
        { message: 'Opción no encontrada en la base de datos.' },
        { status: 404 }
      );
    }

    // 2. Lógica de Grading (Razonamiento Clínico)
    const isCorrect = option.isCorrect;
    const feedback = option.feedback || (isCorrect 
        ? "¡Excelente! Esta es la conducta correcta según la norma MINSAL." 
        : "La respuesta seleccionada es incorrecta. Revisa el feedback para entender el error clínico.");

    // 3. Devolver el resultado al cliente
    return NextResponse.json({
      isCorrect,
      feedback,
      optionId: option.id, 
    });
  } catch (error) {
    console.error(`Error procesando respuesta para el caso ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar la respuesta.' },
      { status: 500 }
    );
  }
}