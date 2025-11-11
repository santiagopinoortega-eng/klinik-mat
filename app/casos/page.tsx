<<<<<<< HEAD
import { getCasosActivos } from '@/services/caso.service';
=======
import { prismaRO } from '@/lib/prisma';
>>>>>>> 68bff7b924ecf91be37b4416b61edb52aac487e6
import CasosPageClient from './CasosPageClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CasosPage() {
<<<<<<< HEAD
  // Usamos el servicio centralizado para obtener los datos.
  // Esto mantiene nuestro componente limpio y la lógica de datos encapsulada.
  const data = await getCasosActivos();
  
=======
  const data = await prismaRO.case.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    select: { id:true, titulo:true, area:true, dificultad:true, resumen:true },
  });

>>>>>>> 68bff7b924ecf91be37b4416b61edb52aac487e6
  return <CasosPageClient data={data} />;
}