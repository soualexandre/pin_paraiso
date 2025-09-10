import { NextResponse } from "next/server";
import { prisma } from '../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("➡️ Body JSON:", body);

    if (body.name) {
      const streets = await prisma.$queryRaw<
        { id: number; logradouro: string; cep: string; bairro: string | null; localidade: string }[]
      >`
        SELECT *
        FROM address
        WHERE LOWER(logradouro) LIKE LOWER(${`%${body.name}%`})
        ORDER BY logradouro ASC
        LIMIT 20
      `;
      console.log(streets);
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
