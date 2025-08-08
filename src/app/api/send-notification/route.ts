import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationViaAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { token, notification } = await request.json();

    if (!token || !notification) {
      return NextResponse.json(
        { error: 'Token e notificação são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do token FCM
    if (typeof token !== 'string' || token.length < 100) {
      return NextResponse.json(
        { error: 'Token FCM inválido' },
        { status: 400 }
      );
    }
    
    // Enviar notificação diretamente via Firebase Admin SDK
    const response = await sendNotificationViaAdmin(token, notification);

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
  return NextResponse.json({ 
    message: 'API route funcionando',
    timestamp: new Date().toISOString()
  });
}
