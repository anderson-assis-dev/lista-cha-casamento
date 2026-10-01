import{useCallback,useEffect,useState}from"react";
import{useNavigate}from"react-router-dom";
import{useAuth}from"./auth";
export function useAdminData<T>(loader:()=>Promise<T>){
const{isAuthenticated,logout}=useAuth();
const navigate=useNavigate();
const[data,setData]=useState<T|null>(null);
const[loading,setLoading]=useState(true);
const reload=useCallback(async()=>{
try{
setData(await loader());
}catch(err){
if((err as{response?:{status?:number}})?.response?.status===401){
logout();
navigate("/admin");
}
}finally{
setLoading(false);
}
},[loader,logout,navigate]);
useEffect(()=>{
if(isAuthenticated)void reload();
},[isAuthenticated,reload]);
return{data,loading,reload,isAuthenticated};
}
