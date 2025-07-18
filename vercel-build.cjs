const { execSync } = require('child_process');
require('dotenv').config({ override: true });

console.log('DEBUG POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

// Проверяем формат URL базы данных
function validateDatabaseUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch (e) {
    return false;
  }
}

async function run() {
  try {
    // Проверяем наличие необходимых переменных окружения
    const requiredEnvVars = [
      'DATABASE_URL',
      'POSTGRES_URL_NON_POOLING',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    // Проверяем формат URL базы данных
    if (!validateDatabaseUrl(process.env.DATABASE_URL)) {
      throw new Error('Invalid DATABASE_URL format');
    }

    if (!validateDatabaseUrl(process.env.POSTGRES_URL_NON_POOLING)) {
      throw new Error('Invalid POSTGRES_URL_NON_POOLING format');
    }

    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

    // Запускаем сборку Next.js
    console.log('Building Next.js application...');
    execSync('npm run build', { stdio: 'inherit' });

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

run();
