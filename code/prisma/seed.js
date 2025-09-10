const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.cwd(), "prisma/cep.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const addresses = JSON.parse(rawData);

  for (const addr of addresses) {
    await prisma.address.upsert({
      where: { cep: addr.cep }, 
      update: {}, 
      create: {
        uf: addr.uf,
        localidade: addr.localidade,
        logradouro: addr.logradouro,
        tipo_numeracao: addr.tipo_numeracao,
        situacao: addr.situacao,
        cep: addr.cep,
        bairro: addr.bairro,
        tipo_codificacao: addr.tipo_codificacao,
      },
    });
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })