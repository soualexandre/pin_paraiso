const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), "prisma/cep.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const addresses = JSON.parse(rawData);

  console.log("Iniciando o processamento de dados...");

  const uniqueCeps = new Set();
  const addressesToCreate = addresses.filter(addr => {
    if (uniqueCeps.has(addr.cep)) {
      return false;
    }
    uniqueCeps.add(addr.cep);
    return true;
  });

  console.log(`Dados processados: ${addressesToCreate.length} endereços únicos a serem inseridos.`);

  const chunkSize = 5000;
  for (let i = 0; i < addressesToCreate.length; i += chunkSize) {
    const chunk = addressesToCreate.slice(i, i + chunkSize);

    const data = chunk.map(addr => ({
      uf: addr.uf,
      localidade: addr.localidade,
      logradouro: addr.logradouro,
      tipo_numeracao: addr.tipo_numeracao,
      situacao: addr.situacao,
      cep: addr.cep,
      bairro: addr.bairro,
      tipo_codificacao: addr.tipo_codificacao,
    }));

    try {
      await prisma.address.createMany({
        data,
      });
    } catch (error) {
      console.error(`Erro ao inserir o lote de dados a partir do índice ${i}:`, error);
    }
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });