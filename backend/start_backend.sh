#!/bin/bash

# Dynamic Form Filler Backend Startup Script

echo "============================================"
echo "🚀 Starting Dynamic Form Filler Backend"
echo "============================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "server.py" ]; then
    echo "📂 Navigating to backend directory..."
    cd backend
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "📋 Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "✏️  Please edit backend/.env and add your API keys:"
    echo "   - DEDALUS_API_KEY"
    echo "   - OPENAI_API_KEY"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Start server
echo ""
echo "✅ Starting server..."
echo ""
python server.py
