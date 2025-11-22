#!/bin/bash

# Complete Glow Mall Setup Script
# Sets up both Laravel backend and Next.js frontend

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🌟 Glow Mall - Complete Setup Script 🌟              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Setup Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Setting up Next.js Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm install

if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
EOF
    echo "✅ Frontend .env.local created"
fi

# Setup Laravel Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Setting up Laravel Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "laravel" ]; then
    cd laravel
    
    # Install composer dependencies
    if command -v composer &> /dev/null; then
        composer install
        php artisan key:generate
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo "⚠️  Please update laravel/.env with your database credentials"
        fi
        
        # Run migrations
        php artisan migrate
        
        # Seed database
        php artisan db:seed
        
        echo "✅ Laravel backend setup completed"
    else
        echo "⚠️  Composer not found. Please install Composer first"
        echo "Visit: https://getcomposer.org/download/"
    fi
    
    cd ..
else
    echo "⚠️  Laravel directory not found. Skipping backend setup"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Setup Completed Successfully! ✅           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Quick Start Guide:"
echo ""
echo "1️⃣  Terminal 1 - Start Laravel Backend:"
echo "   cd laravel"
echo "   php artisan serve"
echo ""
echo "2️⃣  Terminal 2 - Start Next.js Frontend:"
echo "   npm run dev"
echo ""
echo "3️⃣  Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "📚 Default Admin Credentials:"
echo "   Email: admin@glowmall.com"
echo "   Password: admin123"
echo ""
echo "🔗 API Documentation:"
echo "   http://localhost:8000/api/docs (if available)"
echo ""
