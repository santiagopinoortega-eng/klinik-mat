// app/login/page.tsx
'use client'; // 👈 VITAL

import React, { useState } from 'react';
import { signIn } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);

    const result = await signIn('email', {
        email,
        redirect: false, 
        callbackUrl: '/casos', // A dónde irá DESPUÉS de hacer clic en el email
    });

    if (result?.error) {
        setError('Error al enviar el correo. ¿Credenciales SMTP correctas?');
    } else if (result?.ok) {
        // Éxito: El correo fue enviado. Redirigimos a la página de verificación.
        router.push('/login/verificar');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-center text-blue-800">KLINIK-MAT</h1>
        <h2 className="text-xl text-center text-gray-700">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm"
            placeholder="tu@email.com"
          />

          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}