import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationViaAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('API route /api/send-notification chamada');
  
  try {
    const { token, notification } = await request.json();
    console.log('Dados recebidos:', { token: token ? 'presente' : 'ausente', notification });

    if (!token || !notification) {
      console.log('Token ou notificação ausente');
      return NextResponse.json(
        { error: 'Token e notificação são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('Enviando notificação via Firebase Admin SDK...');
    
    // Enviar notificação diretamente via Firebase Admin SDK
    const response = await sendNotificationViaAdmin(token, notification);
    
    console.log('Notificação enviada com sucesso via Admin SDK');

    return NextResponse.json({ success: true, result: response });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// Adicionar método GET para teste
export async function GET() {
  console.log('API route /api/send-notification GET chamada');
  return NextResponse.json({ 
    message: 'API route funcionando',
    timestamp: new Date().toISOString()
  });
}
