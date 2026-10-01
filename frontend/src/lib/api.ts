import axios from"axios";
import type{Convidado,DashboardData,PixConfig,PresenteAdmin,PresentePublico,Presenca}from"./constants";
export const TOKEN_KEY="casa_nova_token";
const api=axios.create({baseURL:"/api"});
api.interceptors.request.use((config)=>{
const token=localStorage.getItem(TOKEN_KEY);
if(token)config.headers.Authorization=`Bearer ${token}`;
return config;
});
export function apiError(err:unknown,fallback:string){
return(err as{response?:{data?:{error?:string}}})?.response?.data?.error??fallback;
}
export async function createConvidado(data:{
nome:string;
telefone:string;
presenca:Presenca;
adultos:number;
criancas:number;
mensagem?:string;
}){
const{data:res}=await api.post<Convidado>("/convidados",data);
return res;
}
export async function getPresentes(){
const{data}=await api.get<PresentePublico[]>("/presentes");
return data;
}
export async function reservarPresentes(convidadoId:string,presenteIds:string[]){
const{data}=await api.post<Convidado>(`/convidados/${convidadoId}/presentes`,{presenteIds});
return data;
}
export async function informarOutro(convidadoId:string,descricao:string){
const{data}=await api.post<Convidado>(`/convidados/${convidadoId}/outro`,{descricao});
return data;
}
export async function registrarPix(convidadoId:string,valor:number){
const{data}=await api.post<{convidado:Convidado;pix:PixConfig}>(`/convidados/${convidadoId}/pix`,{valor});
return data;
}
export async function adminLogin(usuario:string,senha:string){
const{data}=await api.post<{token:string;usuario:string}>("/admin/login",{usuario,senha});
return data;
}
export async function getDashboard(){
const{data}=await api.get<DashboardData>("/admin/dashboard");
return data;
}
export async function getConvidados(){
const{data}=await api.get<Convidado[]>("/admin/convidados");
return data;
}
export async function updateConvidado(id:string,payload:Partial<Omit<Convidado,"presentes">>){
const{data}=await api.put<Convidado>(`/admin/convidados/${id}`,payload);
return data;
}
export async function deleteConvidado(id:string){
const{data}=await api.delete(`/admin/convidados/${id}`);
return data;
}
export async function getPresentesAdmin(){
const{data}=await api.get<PresenteAdmin[]>("/admin/presentes");
return data;
}
export async function createPresente(payload:{nome:string;categoria:string}){
const{data}=await api.post<PresenteAdmin>("/admin/presentes",payload);
return data;
}
export async function updatePresente(id:string,payload:{nome?:string;categoria?:string;ativo?:boolean;liberar?:boolean}){
const{data}=await api.put<PresenteAdmin>(`/admin/presentes/${id}`,payload);
return data;
}
export async function deletePresente(id:string){
const{data}=await api.delete(`/admin/presentes/${id}`);
return data;
}
export async function getConfiguracoes(){
const{data}=await api.get<{pixChave:string;pixNome:string;pixCidade:string;pixCopiaECola:string;pixLink:string}>("/admin/configuracoes");
return data;
}
export async function updateConfiguracoes(payload:{pixChave:string;pixNome:string;pixCidade:string;pixCopiaECola:string;pixLink:string}){
const{data}=await api.put("/admin/configuracoes",payload);
return data;
}
export async function downloadExport(type:"csv"|"excel"){
const{data}=await api.get(`/admin/export/${type}`,{responseType:"blob"});
const ext=type==="csv"?"csv":"xlsx";
const url=URL.createObjectURL(data);
const a=document.createElement("a");
a.href=url;
a.download=`cha-casa-nova.${ext}`;
a.click();
URL.revokeObjectURL(url);
}
export default api;
