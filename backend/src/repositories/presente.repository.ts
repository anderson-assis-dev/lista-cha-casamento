import prisma from"../lib/prisma.js";
import{AppError}from"../middlewares/error.js";
import{PRESENTES_SUGERIDOS}from"../data/presentes.js";
import type{PresenteDTO,UpdatePresenteDTO}from"../dtos/index.js";
export class PresenteRepository{
async ensureDefaults(){
const count=await prisma.presente.count();
if(count>0)return;
let ordem=0;
const data=PRESENTES_SUGERIDOS.flatMap(({categoria,itens})=>itens.map((nome)=>({nome,categoria,ordem:++ordem})));
await prisma.presente.createMany({data});
}
async findPublic(){
const rows=await prisma.presente.findMany({where:{ativo:true},orderBy:{ordem:"asc"},select:{id:true,nome:true,categoria:true,convidadoId:true}});
return rows.map(({convidadoId,...r})=>({...r,reservado:Boolean(convidadoId)}));
}
async findAll(){
return prisma.presente.findMany({orderBy:{ordem:"asc"},include:{convidado:{select:{id:true,nome:true,telefone:true}}}});
}
async findById(id:string){
return prisma.presente.findUnique({where:{id}});
}
async reservar(convidadoId:string,presenteIds:string[]){
const ids=[...new Set(presenteIds)];
return prisma.$transaction(async(tx)=>{
const result=await tx.presente.updateMany({
where:{id:{in:ids},convidadoId:null,ativo:true},
data:{convidadoId,reservadoEm:new Date()},
});
if(result.count!==ids.length){
throw new AppError("Poxa, alguém acabou de escolher um desses itens. Atualizamos a lista pra você escolher outro 💐",409);
}
return tx.presente.findMany({where:{id:{in:ids}},select:{id:true,nome:true,categoria:true}});
});
}
async create(data:PresenteDTO){
const last=await prisma.presente.aggregate({_max:{ordem:true}});
return prisma.presente.create({data:{...data,ordem:(last._max.ordem??0)+1}});
}
async update(id:string,{liberar,...data}:UpdatePresenteDTO){
return prisma.presente.update({where:{id},data:{...data,...(liberar?{convidadoId:null,reservadoEm:null}:{})}});
}
async delete(id:string){
return prisma.presente.delete({where:{id}});
}
}
export const presenteRepository=new PresenteRepository();
