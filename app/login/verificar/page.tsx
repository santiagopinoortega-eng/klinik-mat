// app/login/verificar/page.tsx
// Este puede ser un Server Component simple

import React from 'react';

export default function VerifyRequestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-blue-800">
          📨
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Revisa tu correo
        </h2>
        <p className="mt-4 text-gray-600">
          Te hemos enviado un enlace de inicio de sesión (magic link).
        </p>
        <p className="mt-2 text-sm text-gray-500">
          (Recuerda revisar tu carpeta de spam si no lo ves).
        </p>
      </div>
    </div>
  );
}