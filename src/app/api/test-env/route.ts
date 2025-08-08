import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Definida' : 'Não definida',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Definida' : 'Não definida',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Definida' : 'Não definida',
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? 'Definida' : 'Não definida',
    FIREBASE_SERVER_KEY: process.env.FIREBASE_SERVER_KEY ? 'Definida' : 'Não definida',
  };

  return NextResponse.json({
    message: 'Variáveis de ambiente do Firebase',
    envVars,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('FIREBASE'))
  });
}
