import prisma from"../lib/prisma.js";
import type{ConfiguracaoDTO}from"../dtos/index.js";
export class ConfiguracaoRepository{
async get(){
return prisma.configuracao.upsert({
where:{id:"default"},
update:{},
create:{
id:"default",
pixChave:process.env.PIX_CHAVE??"",
pixNome:process.env.PIX_NOME??"Joao e Ellen",
pixCidade:process.env.PIX_CIDADE??"Lauro de Freitas",
pixCopiaECola:process.env.PIX_COPIA_E_COLA??"",
pixLink:process.env.PIX_LINK??"",
},
});
}
async update(data:ConfiguracaoDTO){
await this.get();
return prisma.configuracao.update({where:{id:"default"},data});
}
}
export const configuracaoRepository=new ConfiguracaoRepository();
