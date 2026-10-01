import{Prisma}from"@prisma/client";
import prisma from"../lib/prisma.js";
import type{CreateConvidadoDTO,UpdateConvidadoDTO}from"../dtos/index.js";
const include={presentes:{select:{id:true,nome:true,categoria:true},orderBy:{ordem:"asc"}}} satisfies Prisma.ConvidadoInclude;
export type ConvidadoComPresentes=Prisma.ConvidadoGetPayload<{include:typeof include}>;
export class ConvidadoRepository{
async create(data:CreateConvidadoDTO&{telefone:string}){
return prisma.convidado.create({data:{
nome:data.nome,
telefone:data.telefone,
presenca:data.presenca,
adultos:data.presenca==="SIM"?Math.max(1,data.adultos):0,
criancas:data.presenca==="SIM"?data.criancas:0,
mensagem:data.mensagem?.trim()||null,
},include});
}
async findByTelefone(telefone:string){
return prisma.convidado.findUnique({where:{telefone},include});
}
async findById(id:string){
return prisma.convidado.findUnique({where:{id},include});
}
async findAll():Promise<ConvidadoComPresentes[]>{
return prisma.convidado.findMany({orderBy:{createdAt:"desc"},include});
}
async update(id:string,data:UpdateConvidadoDTO){
const{pixValor,...rest}=data;
const payload:Prisma.ConvidadoUpdateInput={...rest};
if(pixValor!==undefined){
payload.pixValor=pixValor&&pixValor>0?new Prisma.Decimal(pixValor):null;
payload.pixEm=pixValor&&pixValor>0?new Date():null;
}
return prisma.convidado.update({where:{id},data:payload,include});
}
async setOutro(id:string,descricao:string){
return prisma.convidado.update({where:{id},data:{presenteOutro:descricao},include});
}
async addPix(id:string,valor:number){
return prisma.convidado.update({where:{id},data:{pixValor:{increment:new Prisma.Decimal(valor)},pixEm:new Date()},include});
}
async initPix(id:string,valor:number){
return prisma.convidado.update({where:{id},data:{pixValor:new Prisma.Decimal(valor),pixEm:new Date()},include});
}
async delete(id:string){
return prisma.convidado.delete({where:{id}});
}
}
export const convidadoRepository=new ConvidadoRepository();
