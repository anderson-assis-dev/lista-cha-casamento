import{createContext,useContext,useMemo,useState,type ReactNode}from"react";
import{TOKEN_KEY}from"../lib/api";
interface AuthCtx{
token:string|null;
isAuthenticated:boolean;
login:(t:string)=>void;
logout:()=>void;
}
const Ctx=createContext<AuthCtx|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
const[token,setToken]=useState<string|null>(()=>localStorage.getItem(TOKEN_KEY));
const value=useMemo(()=>({
token,
isAuthenticated:Boolean(token),
login:(t:string)=>{localStorage.setItem(TOKEN_KEY,t);setToken(t);},
logout:()=>{localStorage.removeItem(TOKEN_KEY);setToken(null);},
}),[token]);
return<Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth(){
const ctx=useContext(Ctx);
if(!ctx)throw new Error("useAuth fora do AuthProvider");
return ctx;
}
