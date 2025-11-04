export interface StreetOutput {
  id: string;
  logradouro: string;
  bairro?: string;
  localidade: string;
  uf: string;
  cep: string;
  latitude?: number;
  longitude?: number;
}

export interface SearchResponse {
  results: StreetOutput[];
  total: number;
  showing: number;
  message?: string;
}

export class CEPService {
  private static baseUrl = '/api/cep';

 static async searchCEPs(query: string): Promise<SearchResponse> {
  const baseUrl = typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    : '';

  try {
    const response = await fetch(`${baseUrl}/api/cep?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      console.error('Erro HTTP:', response.status);
      throw new Error('Erro ao buscar CEPs');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro no serviço de CEP:', error);
    return {
      results: [],
      total: 0,
      showing: 0,
      message: 'Erro ao buscar endereços',
    };
  }
}

}