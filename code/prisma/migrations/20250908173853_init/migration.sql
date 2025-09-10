-- CreateTable
CREATE TABLE "Address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uf" TEXT NOT NULL,
    "localidade" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "tipo_numeracao" TEXT,
    "situacao" TEXT,
    "cep" TEXT NOT NULL,
    "bairro" TEXT,
    "tipo_codificacao" TEXT,
    "valido" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_cep_key" ON "Address"("cep");
