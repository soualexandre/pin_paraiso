import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  console.log('✅ Rota /api/cep foi chamada');

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    if (!query || query.length < 3) {
      return NextResponse.json({ 
        results: [], 
        message: 'Digite pelo menos 3 caracteres' 
      });
    }

    const filePath = path.join(process.cwd(), 'data', 'cep.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const ceps = JSON.parse(fileContent);

    const normalized = query.toLowerCase().trim();
    const results = ceps.filter((c: any) =>
      c.logradouro?.toLowerCase().includes(normalized) ||
      c.bairro?.toLowerCase().includes(normalized) ||
      c.localidade?.toLowerCase().includes(normalized) ||
      c.cep.replace(/\D/g, '').includes(normalized.replace(/\D/g, ''))
    );

    return NextResponse.json({
      results: results.slice(0, 50),
      total: results.length,
      showing: results.slice(0, 50).length,
    });
  } catch (error) {
    console.error('❌ Erro na rota /api/cep:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
