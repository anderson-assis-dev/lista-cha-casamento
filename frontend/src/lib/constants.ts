export const EVENT={
title:"Chá de Casa Nova — João & Elen",
couple:"João & Elen",
dateLabel:"08/11",
dateLong:"Domingo, 8 de novembro",
dateISO:"2026-11-08",
time:"13:00",
timeLabel:"13h",
timeEnd:"18:00",
venue:"Colégio Adventista de Lauro de Freitas",
city:"Lauro de Freitas — BA",
mapsUrl:"https://www.google.com/maps/search/?api=1&query=Col%C3%A9gio+Adventista+de+Lauro+de+Freitas",
message:"Depois de tantos sonhos, planos e orações, estamos montando o nosso primeiro lar. E nenhuma casa fica completa sem as pessoas que a gente ama — por isso queremos você com a gente nesse momento tão especial.",
};
export const PHOTOS=Array.from({length:11},(_,i)=>`/fotos/${String(i+1).padStart(2,"0")}.webp`);
export const COVER="/fotos/capa.webp";
export const PIX_SUGESTOES=[50,100,150,200,300,500];
export type Presenca="SIM"|"NAO";
export interface PresenteResumo{
id:string;
nome:string;
categoria:string;
}
export interface PresentePublico extends PresenteResumo{
reservado:boolean;
}
export interface PresenteAdmin extends PresenteResumo{
ordem:number;
ativo:boolean;
convidadoId:string|null;
reservadoEm:string|null;
convidado:{id:string;nome:string;telefone:string}|null;
}
export interface Convidado{
id:string;
nome:string;
telefone:string;
presenca:Presenca;
adultos:number;
criancas:number;
mensagem:string|null;
presenteOutro:string|null;
pixValor:number|null;
pixEm:string|null;
presentes:PresenteResumo[];
createdAt:string;
updatedAt:string;
}
export interface PixConfig{
chave:string;
nome:string;
cidade:string;
copiaECola:string;
link:string;
}
export interface DashboardData{
totalRespostas:number;
confirmados:number;
naoVao:number;
totalAdultos:number;
totalCriancas:number;
totalPessoas:number;
lista:{total:number;reservados:number;disponiveis:number};
pix:{total:number;quantidade:number;media:number};
porTipo:Array<{tipo:string;total:number}>;
porCategoria:Array<{categoria:string;total:number;reservados:number}>;
porDia:Array<{data:string;respostas:number;pix:number}>;
ultimosPix:Array<{id:string;nome:string;valor:number;em:string}>;
mensagens:Array<{id:string;nome:string;mensagem:string;createdAt:string}>;
}
export const brl=(v:number)=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
