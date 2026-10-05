import{useState}from"react";
import{useNavigate}from"react-router-dom";
import{useForm}from"react-hook-form";
import{z}from"zod";
import{zodResolver}from"@hookform/resolvers/zod";
import{Loader2,Lock}from"lucide-react";
import{adminLogin}from"../lib/api";
import{useAuth}from"../hooks";
import{Button,Input}from"../components/ui";
import{FloralCluster,PetalsBg}from"../components/decor";
const schema=z.object({
usuario:z.string().min(1,"Informe o usuário"),
senha:z.string().min(1,"Informe a senha"),
});
type FormData=z.infer<typeof schema>;
export function AdminLoginPage(){
const{login}=useAuth();
const navigate=useNavigate();
const[error,setError]=useState("");
const[loading,setLoading]=useState(false);
const{register,handleSubmit,formState:{errors}}=useForm<FormData>({resolver:zodResolver(schema)});
async function onSubmit(data:FormData){
setLoading(true);
setError("");
try{
const res=await adminLogin(data.usuario,data.senha);
login(res.token);
navigate("/admin/dashboard");
}catch{
setError("Usuário ou senha inválidos");
}finally{
setLoading(false);
}
}
return(
<div className="relative flex min-h-screen items-center justify-center bg-blush px-5">
<PetalsBg/>
<form onSubmit={handleSubmit(onSubmit)} className="glass relative z-10 w-full max-w-md space-y-5 rounded-[2rem] p-8 shadow-xl">
<FloralCluster className="absolute -right-10 -top-12 w-36"/>
<div className="flex items-center gap-3">
<div className="bg-bouquet rounded-2xl p-3 text-white">
<Lock className="h-5 w-5"/>
</div>
<div>
<h1 className="font-display text-3xl font-semibold text-wine-800">Painel do Chá</h1>
<p className="text-sm text-wine-500">Casa Nova · João &amp; Ellen</p>
</div>
</div>
<Input label="Usuário" autoComplete="username" error={errors.usuario?.message} {...register("usuario")}/>
<Input label="Senha" type="password" autoComplete="current-password" error={errors.senha?.message} {...register("senha")}/>
{error&&<p className="text-sm text-red-500">{error}</p>}
<Button type="submit" className="w-full" disabled={loading}>
{loading?<Loader2 className="h-4 w-4 animate-spin"/>:null}
Entrar
</Button>
</form>
</div>
);
}
