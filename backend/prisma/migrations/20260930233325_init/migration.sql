-- CreateEnum
CREATE TYPE "Presenca" AS ENUM ('SIM', 'NAO');

-- CreateTable
CREATE TABLE "Convidado" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "presenca" "Presenca" NOT NULL DEFAULT 'SIM',
    "adultos" INTEGER NOT NULL DEFAULT 1,
    "criancas" INTEGER NOT NULL DEFAULT 0,
    "mensagem" TEXT,
    "presenteOutro" TEXT,
    "pixValor" DECIMAL(10,2),
    "pixEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convidado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "convidadoId" TEXT,
    "reservadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "pixChave" TEXT NOT NULL DEFAULT '',
    "pixNome" TEXT NOT NULL DEFAULT 'Joao e Elen',
    "pixCidade" TEXT NOT NULL DEFAULT 'Lauro de Freitas',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Convidado_telefone_key" ON "Convidado"("telefone");

-- CreateIndex
CREATE INDEX "Presente_convidadoId_idx" ON "Presente"("convidadoId");

-- AddForeignKey
ALTER TABLE "Presente" ADD CONSTRAINT "Presente_convidadoId_fkey" FOREIGN KEY ("convidadoId") REFERENCES "Convidado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
