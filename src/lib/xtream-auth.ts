// Serviço de autenticação para API Xtream IPTV
const DNS_SERVER = 'http://dnscine.top:80';

export interface XtreamUserInfo {
  username: string;
  password: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
  server_info?: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

export class XtreamAuthService {
  /**
   * Faz login no servidor Xtream IPTV através da API route
   */
  static async login(username: string, password: string): Promise<XtreamUserInfo> {
    try {
      const response = await fetch('/api/xtream-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      console.log('✅ Login Xtream realizado com sucesso:', data);

      return data;
    } catch (error) {
      console.error('❌ Erro no login Xtream:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conectividade. Verifique sua conexão com a internet.');
      }
      
      throw error;
    }
  }

  /**
   * Verifica se as credenciais ainda são válidas
   */
  static async validateCredentials(username: string, password: string): Promise<boolean> {
    try {
      await this.login(username, password);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Faz logout (opcional, nem todos os servidores Xtream suportam)
   */
  static async logout(username: string): Promise<void> {
    try {
      // Alguns servidores Xtream não têm endpoint de logout específico
      // Apenas limpamos dados locais
      console.log('📤 Logout Xtream para usuário:', username);
    } catch (error) {
      console.error('Erro no logout Xtream:', error);
    }
  }
}