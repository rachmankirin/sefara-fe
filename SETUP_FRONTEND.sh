#!/bin/bash

# Glow Mall Next.js Frontend Setup Script

echo "🚀 Starting Glow Mall Next.js Frontend Setup..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
EOF
    echo "✅ .env.local created"
    echo "⚠️  Update NEXT_PUBLIC_API_URL to match your Laravel API URL"
else
    echo "✅ .env.local already exists"
fi

echo "✅ Frontend setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your API URL"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000"
