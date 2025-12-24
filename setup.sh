#!/bin/bash

echo "🎭 Playwright Test Generator - Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi

echo "✓ npm dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright Chromium browser..."
echo "   (This will download ~160MB, may take a few minutes)"
echo ""

npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    echo "   Try running manually: npx playwright install chromium"
    exit 1
fi

echo ""
echo "✓ Playwright browsers installed"
echo ""

# Optional: Install system dependencies
read -p "Install system dependencies for Playwright? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx playwright install-deps chromium
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "   npm run dev"
echo ""
echo "To build for production, run:"
echo "   npm run build"
echo ""
