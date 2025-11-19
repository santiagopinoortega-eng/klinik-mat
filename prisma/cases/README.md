# 📚 Casos Clínicos por Módulo

Esta carpeta contiene los casos clínicos organizados por materia/módulo.

## 📁 Estructura de Archivos

- `RN.json5` - Casos de **Recién Nacido**
- `EMBARAZO.json5` - Casos de **Embarazo**
- `PARTO.json5` - Casos de **Parto**
- `PUERPERIO.json5` - Casos de **Puerperio**

## 📝 Formato de Casos

Cada archivo debe contener un array de casos con la siguiente estructura:

```json5
[
  {
    "id": "modulo-tema-numero",        // ej: "rn-ictericia-01"
    "modulo": "Recién Nacido",         // Nombre del módulo
    "dificultad": "Baja",              // "Baja" | "Media" | "Alta"
    "titulo": "Título descriptivo",
    "vigneta": "Historia clínica completa del caso...",
    
    "pasos": [
      // Baja = 5 pasos, Media = 6 pasos, Alta = 7 pasos
      {
        "id": "p1",
        "tipo": "mcq",                 // Pregunta de opción múltiple
        "enunciado": "Pregunta clínica...",
        "opciones": [
          {
            "id": "a",
            "texto": "Opción A",
            "esCorrecta": true,
            "explicacion": "Razón por la que ES correcta..."
          },
          {
            "id": "b",
            "texto": "Opción B",
            "esCorrecta": false,
            "explicacion": "Razón por la que NO es correcta..."
          },
          // ... opciones C y D
        ]
      },
      // ... más pasos
    ],
    
    "feedback_dinamico": {
      "bajo": "Mensaje para 0-30% de respuestas correctas",
      "medio": "Mensaje para 31-60% de respuestas correctas",
      "alto": "Mensaje para 61-100% de respuestas correctas"
    },
    
    "referencias": [
      "MINSAL — Norma Técnica...",
      "OMS — Guía..."
    ]
  }
]
```

## 🔄 Carga de Casos

El script `npm run seed:cases` carga automáticamente:
1. Los casos del archivo principal `prisma/cases.json5` (legacy)
2. Todos los archivos `*.json5` de esta carpeta

```bash
npm run seed:cases
```

## 📊 Niveles de Dificultad

| Nivel | Pasos | Uso |
|-------|-------|-----|
| Baja  | 5     | Casos introductorios, conceptos básicos |
| Media | 6     | Casos intermedios, diagnóstico diferencial |
| Alta  | 7     | Casos complejos, manejo avanzado |

## ✅ Checklist para Nuevos Casos

- [ ] ID único y descriptivo
- [ ] Módulo claramente definido
- [ ] Dificultad apropiada (5/6/7 pasos)
- [ ] Viñeta clínica realista y completa
- [ ] 4 opciones por pregunta (A, B, C, D)
- [ ] Explicación de por qué cada opción es correcta/incorrecta
- [ ] Feedback adaptativo (bajo/medio/alto)
- [ ] Referencias bibliográficas (MINSAL, OMS, etc.)
