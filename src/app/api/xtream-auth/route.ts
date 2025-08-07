import { NextRequest, NextResponse } from 'next/server';

const DNS_SERVER = 'http://dnscine.top:80';

export async function POST(request: NextRequest) {
  return handleXtreamAuth(request);
}

export async function GET(request: NextRequest) {
  return handleXtreamAuth(request);
}

async function handleXtreamAuth(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Fazer a requisição para o servidor Xtream (sem action específica para obter info geral)
    const response = await fetch(
      `${DNS_SERVER}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error(`Xtream API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Erro do servidor IPTV: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Verificar se a resposta contém user_info (estrutura correta da API)
    if (!data.user_info) {
      return NextResponse.json(
        { error: 'Resposta inválida do servidor IPTV' },
        { status: 500 }
      );
    }

    const userInfo = data.user_info;

    // Verificar se a autenticação foi bem-sucedida
    if (userInfo.auth !== 1) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se a conta não está expirada
    if (userInfo.exp_date && userInfo.exp_date !== "0" && userInfo.exp_date !== null) {
      const expDate = new Date(parseInt(userInfo.exp_date) * 1000);
      const now = new Date();
      
      if (expDate < now) {
        return NextResponse.json(
          { error: 'Conta expirada' },
          { status: 401 }
        );
      }
    }

    // Verificar se a conta está ativa
    if (userInfo.status !== 'Active') {
      return NextResponse.json(
        { error: 'Conta inativa' },
        { status: 401 }
      );
    }

    // Retornar dados do usuário com a estrutura correta
    return NextResponse.json({
      username: userInfo.username,
      password: userInfo.password,
      auth: userInfo.auth,
      status: userInfo.status,
      exp_date: userInfo.exp_date,
      is_trial: userInfo.is_trial,
      active_cons: userInfo.active_cons,
      created_at: userInfo.created_at,
      max_connections: userInfo.max_connections,
      allowed_output_formats: userInfo.allowed_output_formats,
      server_info: data.server_info
    });

  } catch (error) {
    console.error('Erro na autenticação Xtream:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao servidor IPTV. Verifique sua conexão ou tente novamente mais tarde.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}