import bcrypt from"bcryptjs";
import jwt from"jsonwebtoken";
import ExcelJS from"exceljs";
import{AppError,normalizePhone}from"../middlewares/error.js";
import{convidadoRepository,type ConvidadoComPresentes}from"../repositories/convidado.repository.js";
import{presenteRepository}from"../repositories/presente.repository.js";
import{configuracaoRepository}from"../repositories/configuracao.repository.js";
import type{CreateConvidadoDTO,UpdateConvidadoDTO,ReservarDTO,OutroDTO,PixDTO,PresenteDTO,UpdatePresenteDTO,LoginDTO,ConfiguracaoDTO}from"../dtos/index.js";
function serialize(c:ConvidadoComPresentes){
return{...c,pixValor:c.pixValor?Number(c.pixValor):null};
}
function tiposPresente(c:ConvidadoComPresentes){
const tipos:string[]=[];
if(c.presentes.length)tipos.push("Lista");
if(c.pixValor&&Number(c.pixValor)>0)tipos.push("Pix");
if(c.presenteOutro)tipos.push("Outro");
return tipos;
}
function descreverPresente(c:ConvidadoComPresentes){
const partes:string[]=[];
if(c.presentes.length)partes.push(c.presentes.map((p)=>p.nome).join(", "));
if(c.pixValor&&Number(c.pixValor)>0)partes.push(`Pix R$ ${Number(c.pixValor).toFixed(2).replace(".",",")}`);
if(c.presenteOutro)partes.push(`Outro: ${c.presenteOutro}`);
return partes.join(" | ");
}
export class ConvidadoService{
async create(data:CreateConvidadoDTO){
const telefone=normalizePhone(data.telefone);
if(telefone.length<10)throw new AppError("Telefone inválido");
const existing=await convidadoRepository.findByTelefone(telefone);
if(existing)throw new AppError("Já recebemos uma resposta com este WhatsApp. Se precisar mudar algo, fale com o João ou a Ellen 💛",409);
return serialize(await convidadoRepository.create({...data,telefone}));
}
private async mustExist(id:string){
const convidado=await convidadoRepository.findById(id);
if(!convidado)throw new AppError("Convidado não encontrado",404);
return convidado;
}
async reservar(id:string,data:ReservarDTO){
await this.mustExist(id);
await presenteRepository.reservar(id,data.presenteIds);
return serialize((await convidadoRepository.findById(id))!);
}
async outro(id:string,data:OutroDTO){
await this.mustExist(id);
return serialize(await convidadoRepository.setOutro(id,data.descricao));
}
async pix(id:string,data:PixDTO){
const convidado=await this.mustExist(id);
const updated=convidado.pixValor?await convidadoRepository.addPix(id,data.valor):await convidadoRepository.initPix(id,data.valor);
const config=await configuracaoRepository.get();
return{convidado:serialize(updated),pix:{chave:config.pixChave,nome:config.pixNome,cidade:config.pixCidade,copiaECola:config.pixCopiaECola,link:config.pixLink}};
}
async presentesPublicos(){
return presenteRepository.findPublic();
}
async list(){
return(await convidadoRepository.findAll()).map(serialize);
}
async update(id:string,data:UpdateConvidadoDTO){
await this.mustExist(id);
const payload={...data};
if(data.telefone){
payload.telefone=normalizePhone(data.telefone);
const byPhone=await convidadoRepository.findByTelefone(payload.telefone);
if(byPhone&&byPhone.id!==id)throw new AppError("Já existe um convidado com este telefone",409);
}
return serialize(await convidadoRepository.update(id,payload));
}
async remove(id:string){
await this.mustExist(id);
await convidadoRepository.delete(id);
return{ok:true};
}
async dashboard(){
const[convidados,presentes]=await Promise.all([convidadoRepository.findAll(),presenteRepository.findAll()]);
const vao=convidados.filter((c)=>c.presenca==="SIM");
const naoVao=convidados.filter((c)=>c.presenca==="NAO");
const totalAdultos=vao.reduce((s,c)=>s+c.adultos,0);
const totalCriancas=vao.reduce((s,c)=>s+c.criancas,0);
const pixDoadores=convidados.filter((c)=>c.pixValor&&Number(c.pixValor)>0);
const pixTotal=pixDoadores.reduce((s,c)=>s+Number(c.pixValor),0);
const ativos=presentes.filter((p)=>p.ativo);
const reservados=ativos.filter((p)=>p.convidadoId);
const comLista=convidados.filter((c)=>c.presentes.length>0).length;
const comOutro=convidados.filter((c)=>c.presenteOutro).length;
const semPresente=convidados.filter((c)=>tiposPresente(c).length===0).length;
const categorias=new Map<string,{categoria:string;total:number;reservados:number}>();
for(const p of ativos){
const row=categorias.get(p.categoria)??{categoria:p.categoria,total:0,reservados:0};
row.total+=1;
if(p.convidadoId)row.reservados+=1;
categorias.set(p.categoria,row);
}
const porDia=new Map<string,{data:string;respostas:number;pix:number}>();
for(const c of convidados){
const day=c.createdAt.toISOString().slice(0,10);
const row=porDia.get(day)??{data:day,respostas:0,pix:0};
row.respostas+=1;
porDia.set(day,row);
}
for(const c of pixDoadores){
const day=(c.pixEm??c.createdAt).toISOString().slice(0,10);
const row=porDia.get(day)??{data:day,respostas:0,pix:0};
row.pix+=Number(c.pixValor);
porDia.set(day,row);
}
return{
totalRespostas:convidados.length,
confirmados:vao.length,
naoVao:naoVao.length,
totalAdultos,
totalCriancas,
totalPessoas:totalAdultos+totalCriancas,
lista:{total:ativos.length,reservados:reservados.length,disponiveis:ativos.length-reservados.length},
pix:{total:Math.round(pixTotal*100)/100,quantidade:pixDoadores.length,media:pixDoadores.length?Math.round((pixTotal/pixDoadores.length)*100)/100:0},
porTipo:[
{tipo:"Item da lista",total:comLista},
{tipo:"Pix",total:pixDoadores.length},
{tipo:"Outro presente",total:comOutro},
{tipo:"Sem presente",total:semPresente},
],
porCategoria:[...categorias.values()],
porDia:[...porDia.values()].sort((a,b)=>a.data.localeCompare(b.data)),
ultimosPix:pixDoadores
.sort((a,b)=>(b.pixEm?.getTime()??0)-(a.pixEm?.getTime()??0))
.slice(0,5)
.map((c)=>({id:c.id,nome:c.nome,valor:Number(c.pixValor),em:c.pixEm})),
mensagens:convidados.filter((c)=>c.mensagem).slice(0,20).map((c)=>({id:c.id,nome:c.nome,mensagem:c.mensagem,createdAt:c.createdAt})),
};
}
private async exportRows(){
const rows=await convidadoRepository.findAll();
return rows.map((r)=>({
nome:r.nome,
telefone:r.telefone,
presenca:r.presenca==="SIM"?"Vai":"Não vai",
adultos:r.adultos,
criancas:r.criancas,
total:r.adultos+r.criancas,
itens:r.presentes.map((p)=>p.nome).join(", "),
pix:r.pixValor?Number(r.pixValor):0,
outro:r.presenteOutro??"",
presente:descreverPresente(r)||"—",
mensagem:r.mensagem??"",
data:r.createdAt.toLocaleString("pt-BR",{timeZone:"America/Bahia"}),
}));
}
async exportCsv(){
const rows=await this.exportRows();
const q=(v:string|number)=>`"${String(v).replace(/"/g,'""')}"`;
const header="Nome,Telefone,Presença,Adultos,Crianças,Total Pessoas,Itens da lista,Pix (R$),Outro presente,Mensagem,Data";
const lines=rows.map((r)=>[r.nome,r.telefone,r.presenca,r.adultos,r.criancas,r.total,r.itens,r.pix.toFixed(2).replace(".",","),r.outro,r.mensagem,r.data].map(q).join(","));
return[header,...lines].join("\n");
}
async exportExcel(){
const rows=await this.exportRows();
const presentes=await presenteRepository.findAll();
const workbook=new ExcelJS.Workbook();
const sheet=workbook.addWorksheet("Convidados");
sheet.columns=[
{header:"Nome",key:"nome",width:30},
{header:"Telefone",key:"telefone",width:18},
{header:"Presença",key:"presenca",width:10},
{header:"Adultos",key:"adultos",width:10},
{header:"Crianças",key:"criancas",width:10},
{header:"Total Pessoas",key:"total",width:14},
{header:"Itens da lista",key:"itens",width:40},
{header:"Pix (R$)",key:"pix",width:12,style:{numFmt:'"R$" #,##0.00'}},
{header:"Outro presente",key:"outro",width:30},
{header:"Mensagem",key:"mensagem",width:50},
{header:"Data",key:"data",width:22},
];
sheet.getRow(1).font={bold:true};
for(const r of rows)sheet.addRow(r);
const lista=workbook.addWorksheet("Lista de presentes");
lista.columns=[
{header:"Item",key:"nome",width:40},
{header:"Categoria",key:"categoria",width:24},
{header:"Status",key:"status",width:14},
{header:"Escolhido por",key:"quem",width:30},
{header:"Telefone",key:"telefone",width:18},
];
lista.getRow(1).font={bold:true};
for(const p of presentes){
lista.addRow({nome:p.nome,categoria:p.categoria,status:!p.ativo?"Inativo":p.convidado?"Escolhido":"Disponível",quem:p.convidado?.nome??"",telefone:p.convidado?.telefone??""});
}
const buffer=await workbook.xlsx.writeBuffer();
return Buffer.from(buffer);
}
}
export class PresenteService{
async list(){
return presenteRepository.findAll();
}
async create(data:PresenteDTO){
return presenteRepository.create(data);
}
async update(id:string,data:UpdatePresenteDTO){
if(!(await presenteRepository.findById(id)))throw new AppError("Item não encontrado",404);
return presenteRepository.update(id,data);
}
async remove(id:string){
if(!(await presenteRepository.findById(id)))throw new AppError("Item não encontrado",404);
await presenteRepository.delete(id);
return{ok:true};
}
}
export class ConfiguracaoService{
async get(){
return configuracaoRepository.get();
}
async update(data:ConfiguracaoDTO){
return configuracaoRepository.update(data);
}
}
export class AuthService{
async login(data:LoginDTO){
const usuario=process.env.ADMIN_USER??"admin";
const senha=process.env.ADMIN_PASSWORD??"admin123";
const userOk=data.usuario===usuario;
const passOk=data.senha===senha||(await bcrypt.compare(data.senha,senha).catch(()=>false));
if(!userOk||!passOk)throw new AppError("Usuário ou senha inválidos",401);
const secret=process.env.JWT_SECRET;
if(!secret)throw new AppError("JWT não configurado",500);
const expiresIn=process.env.JWT_EXPIRES_IN??"7d";
const token=jwt.sign({usuario:data.usuario},secret,{expiresIn}as jwt.SignOptions);
return{token,usuario:data.usuario};
}
}
export const convidadoService=new ConvidadoService();
export const presenteService=new PresenteService();
export const configuracaoService=new ConfiguracaoService();
export const authService=new AuthService();
