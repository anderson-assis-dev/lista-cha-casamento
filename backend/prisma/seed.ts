import{PrismaClient}from"@prisma/client";
import{PRESENTES_SUGERIDOS}from"../src/data/presentes.js";
const prisma=new PrismaClient();
async function main(){
const reset=process.argv.includes("--reset");
if(reset){
await prisma.presente.deleteMany();
await prisma.convidado.deleteMany();
}else if(process.argv.includes("--trocar-presentes")){
await prisma.presente.deleteMany();
}
if(await prisma.presente.count()===0){
let ordem=0;
await prisma.presente.createMany({data:PRESENTES_SUGERIDOS.flatMap(({categoria,itens})=>itens.map((nome)=>({nome,categoria,ordem:++ordem})))});
}
await prisma.configuracao.upsert({
where:{id:"default"},
update:{},
create:{id:"default",pixChave:process.env.PIX_CHAVE??"",pixNome:process.env.PIX_NOME??"Joao e Ellen",pixCidade:process.env.PIX_CIDADE??"Lauro de Freitas",
pixCopiaECola:process.env.PIX_COPIA_E_COLA??"",
pixLink:process.env.PIX_LINK??""},
});
console.log(`Presentes: ${await prisma.presente.count()}`);
}
main().finally(()=>prisma.$disconnect());
