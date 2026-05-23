#!/bin/bash
# Quick start script for LinkTik development

echo "🚀 LinkTik Development Setup"
echo "=============================="

# Check dependencies
echo "📋 Checking dependencies..."
node --version || { echo "❌ Node.js not found"; exit 1; }
npm --version || { echo "❌ npm not found"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Backend setup
echo "🔧 Setting up backend..."
cd backend
cp .env.example .env
echo "✅ Backend .env created"

# Check if Docker is available
if command -v docker &> /dev/null; then
  echo "🐳 Starting Docker services..."
  cd ..
  docker-compose up -d
  echo "✅ Docker services started"
else
  echo "⚠️  Docker not found. Set up database manually:"
  echo "   - PostgreSQL: postgresql://postgres:postgres@localhost:5432/linktik"
  echo "   - Redis: redis://localhost:6379"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. cd backend && npm run db:migrate"
echo "  2. npm run dev"
echo ""
echo "🌐 Access services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:5000"
echo ""
