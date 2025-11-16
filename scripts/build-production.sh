
#!/bin/bash

echo "🚀 Building for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:push

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit

echo "✅ Build complete! Ready for deployment."
