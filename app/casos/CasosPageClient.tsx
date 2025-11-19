'use client';

import { CasoListItem } from '@/services/caso.service';
import { useMemo, useState } from 'react';
import CaseCard from '@/app/components/CaseCard';
import Badge from '@/app/components/ui/Badge';

export default function CasosPageClient({ data }: { data: CasoListItem[] }) {

  const [q, setQ] = useState('');
  const [modulo, setModulo] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  // Extraer módulos únicos (soportando tanto 'area' como 'modulo')
  const modulos = useMemo(() => {
    const uniqueModulos = new Set<string>();
    data.forEach(d => {
      const mod = (d as any).modulo || d.area;
      if (mod) uniqueModulos.add(mod);
    });
    return ['all', ...Array.from(uniqueModulos)];
  }, [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(d => {
      const moduloActual = (d as any).modulo || d.area;
      const dificultadActual = String((d as any).dificultad || d.difficulty);
      
      return (
        (modulo === 'all' || moduloActual === modulo) &&
        (difficulty === 'all' || dificultadActual === difficulty || 
         (difficulty === 'Baja' && (dificultadActual === '1' || dificultadActual === 'Baja')) ||
         (difficulty === 'Media' && (dificultadActual === '2' || dificultadActual === 'Media')) ||
         (difficulty === 'Alta' && (dificultadActual === '3' || dificultadActual === 'Alta'))
        ) &&
        (!s || d.title.toLowerCase().includes(s) || (d.summary ?? '').toLowerCase().includes(s))
      );
    });
  }, [data, q, modulo, difficulty]);

  return (
    <div className="container py-8">
      <div className="mb-4">
        <div className="filters-bar">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar por título o resumen…"
            className="w-full sm:w-72 rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Buscar casos"
          />
          <select
            value={modulo}
            onChange={(e)=>setModulo(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Filtrar por módulo"
          >
            {modulos.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos los módulos' : m}</option>)}
          </select>

          <select
            value={difficulty}
            onChange={(e)=>setDifficulty(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Filtrar por dificultad"
          >
            <option value="all">Todas las dificultades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="1">Fácil (Legacy)</option>
            <option value="2">Medio (Legacy)</option>
            <option value="3">Difícil (Legacy)</option>
          </select>

          <div className="ml-auto text-xs text-[var(--km-text-700)]"><Badge>{filtered.length}</Badge> {filtered.length === 1 ? 'resultado' : 'resultados'}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
          No hay resultados para <b>{q || '(vacío)'}</b>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <CaseCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}