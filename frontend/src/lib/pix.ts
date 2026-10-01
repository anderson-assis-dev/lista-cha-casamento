// Gera o "Pix Copia e Cola" (BR Code estático, padrão EMV do Banco Central) sem valor definido,
// para que a pessoa digite o valor no app do banco.
function field(id:string,value:string){
return`${id}${String(value.length).padStart(2,"0")}${value}`;
}
function clean(text:string,max:number){
return text.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9 ]/g,"").trim().toUpperCase().slice(0,max);
}
function crc16(payload:string){
let crc=0xffff;
for(let i=0;i<payload.length;i++){
crc^=payload.charCodeAt(i)<<8;
for(let j=0;j<8;j++){
crc=crc&0x8000?(crc<<1)^0x1021:crc<<1;
crc&=0xffff;
}
}
return crc.toString(16).toUpperCase().padStart(4,"0");
}
export function normalizePixKey(key:string){
const k=key.trim();
if(k.includes("@"))return k.toLowerCase();
if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k))return k.toLowerCase();
const digits=k.replace(/\D/g,"");
if(k.startsWith("+"))return`+${digits}`;
return digits||k;
}
export function buildPixPayload({chave,nome,cidade}:{chave:string;nome:string;cidade:string}){
const merchant=field("00","br.gov.bcb.pix")+field("01",normalizePixKey(chave));
const body=
field("00","01")+
field("26",merchant)+
field("52","0000")+
field("53","986")+
field("58","BR")+
field("59",clean(nome,25)||"RECEBEDOR")+
field("60",clean(cidade,15)||"BRASIL")+
field("62",field("05","***"))+
"6304";
return body+crc16(body);
}
export function resolvePixPayload(pix:{chave:string;nome:string;cidade:string;copiaECola?:string}){
if(pix.copiaECola)return pix.copiaECola;
return pix.chave?buildPixPayload(pix):"";
}
export function maskPixKey(key:string){
const d=key.replace(/\D/g,"");
if(/^\d{11}$/.test(key.trim())||(d.length===11&&/^[\d.-]+$/.test(key.trim())))return`${d.slice(0,3)}.***.***-${d.slice(9)}`;
return key;
}
