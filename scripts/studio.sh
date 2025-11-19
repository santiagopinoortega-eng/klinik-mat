#!/bin/bash
# Script para abrir Prisma Studio con conexión directa (sin pooler)

# Usar conexión sin pooler para Prisma Studio
export DATABASE_URL="postgresql://neondb_owner:npg_AR8JcVpt5CMN@ep-red-leaf-ahuxwbwi.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "🚀 Abriendo Prisma Studio con conexión directa..."
npx prisma studio
