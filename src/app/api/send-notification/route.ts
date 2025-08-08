import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationViaAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('API route /api/send-notification chamada');
  
  try {
    const { token, notification } = await request.json();
    console.log('Dados recebidos:', { 
      token: token ? `${token.substring(0, 20)}...` : 'ausente', 
      notification 
    });

    if (!token || !notification) {
      console.log('Token ou notificação ausente');
      return NextResponse.json(
        { error: 'Token e notificação são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do token FCM
    if (typeof token !== 'string' || token.length < 100) {
      console.log('Token FCM inválido:', { tokenLength: token?.length, tokenType: typeof token });
      return NextResponse.json(
        { error: 'Token FCM inválido' },
        { status: 400 }
      );
    }

    console.log('Enviando notificação via Firebase Admin SDK...');
    console.log('Token FCM (primeiros 50 chars):', token.substring(0, 50));
    
    // Enviar notificação diretamente via Firebase Admin SDK
    const response = await sendNotificationViaAdmin(token, notification);
    
    console.log('Notificação enviada com sucesso via Admin SDK');

    return NextResponse.json({ success: true, result: response });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    
    // Fornecer informações mais detalhadas sobre o erro
    let errorMessage = 'Erro interno do servidor';
    let errorDetails = 'Erro desconhecido';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || 'Sem stack trace';
    }
    
    // Verificar se é um erro específico do Firebase
    if (errorMessage.includes('Requested entity was not found')) {
      errorMessage = 'Token FCM inválido ou expirado';
      errorDetails = 'O token FCM fornecido não foi encontrado no Firebase. Isso pode acontecer se o token foi invalidado ou expirou.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
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
