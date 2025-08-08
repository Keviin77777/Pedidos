import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API de teste funcionando',
    timestamp: new Date().toISOString(),
    env: {
      hasServerKey: !!process.env.FIREBASE_SERVER_KEY,
      hasVapidKey: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST funcionando',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar POST',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
