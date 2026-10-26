'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrecintosView } from '@/modules/precintos/containers/Precintos-View/PrecintosView';

export default function PrecintosPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Validación simple: si hay un proyecto seleccionado, permite el acceso.
    // Si no, redirige a la página principal.
    const projectId = localStorage.getItem("projectId") || localStorage.getItem("selectedProjectId");
    
    if (!projectId) {
      router.replace('/clientes/all'); // o a donde quieras redirigir
      return;
    }

    setIsReady(true);
  }, [router]);

  // Mientras se valida, mostramos un mensaje (para evitar parpadeos)
  if (!isReady) {
    return <div className="p-8 text-center text-gray-500">Verificando permisos...</div>;
  }

  return <PrecintosView />;
}