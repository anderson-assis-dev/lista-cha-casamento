import{useEffect,useState}from"react";
import{EVENT}from"../lib/constants";
export{AuthProvider,useAuth}from"./auth";
function remaining(){
const target=new Date(`${EVENT.dateISO}T${EVENT.time}:00-03:00`).getTime();
const diff=Math.max(0,target-Date.now());
return{
dias:Math.floor(diff/86_400_000),
horas:Math.floor((diff/3_600_000)%24),
minutos:Math.floor((diff/60_000)%60),
segundos:Math.floor((diff/1000)%60),
chegou:diff===0,
};
}
export function useCountdown(){
const[value,setValue]=useState(remaining);
useEffect(()=>{
const id=setInterval(()=>setValue(remaining()),1000);
return()=>clearInterval(id);
},[]);
return value;
}
const GUEST_KEY="casa_nova_convidado";
export interface GuestRef{id:string;nome:string;presenca?:"SIM"|"NAO"}
export function loadGuest():GuestRef|null{
try{
const raw=localStorage.getItem(GUEST_KEY);
return raw?JSON.parse(raw) as GuestRef:null;
}catch{return null;}
}
export function saveGuest(g:GuestRef|null){
try{
if(g)localStorage.setItem(GUEST_KEY,JSON.stringify(g));
else localStorage.removeItem(GUEST_KEY);
}catch{/* storage indisponível */}
}
