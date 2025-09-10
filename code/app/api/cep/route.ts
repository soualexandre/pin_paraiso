import { NextResponse } from "next/server";
import { prisma } from '../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("➡️ Body JSON:", body);

    if (body.name) {
      const normalizeString = (str: string) => {
        if (!str) return '';
        return str
          .toLowerCase()
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, "") 
          .replace(/[^\w\s]/gi, '');
      };

      const normalizedQuery = normalizeString(body.name);

      let streets = await prisma.$queryRaw<
        { id: number; logradouro: string; cep: string; bairro: string | null; localidade: string }[]
      >`
        SELECT *
        FROM address
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(logradouro), 'ç', 'c'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') LIKE ${`%${normalizedQuery}%`}
        ORDER BY logradouro ASC
        LIMIT 20
      `;

      if (streets.length === 0) {
        console.log("➡️ queryRaw não encontrou resultados, tentando findMany...");
        streets = await prisma.address.findMany({
          where: {
            logradouro: {
              contains: body.name as string,
            },
          },
          orderBy: {
            logradouro: "asc",
          },
          take: 20,
        });
      }

      return NextResponse.json(streets);
    }

    if (body.cep) {
      const street = await prisma.address.findUnique({
        where: { cep: body.cep as string },
      });
      return NextResponse.json(street || {});
    }

    if (body.bairro) {
      const streets = await prisma.address.findMany({
        where: {
          bairro: { contains: body.bairro as string },
        },
        orderBy: { logradouro: "asc" },
        take: 20,
      });
      return NextResponse.json(streets);
    }

    return NextResponse.json(
      { message: "Parameters (name, cep, or bairro) are required" },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
