import{useEffect,useState}from"react";
import{Navigate}from"react-router-dom";
import{QRCodeSVG}from"qrcode.react";
import{Loader2,Save}from"lucide-react";
import{getConfiguracoes,updateConfiguracoes}from"../lib/api";
import{resolvePixPayload}from"../lib/pix";
import{useAdminData}from"../hooks/admin";
import{AdminShell,Panel}from"../components/AdminShell";
import{Button,Input,TextArea}from"../components/ui";
type Config=Awaited<ReturnType<typeof getConfiguracoes>>;
export function AdminConfigPage(){
const{data,loading,isAuthenticated}=useAdminData(getConfiguracoes);
const[form,setForm]=useState<Config|null>(null);
const[saving,setSaving]=useState(false);
const[msg,setMsg]=useState("");
useEffect(()=>{
if(data)setForm(data);
},[data]);
if(!isAuthenticated)return<Navigate to="/admin" replace/>;
async function save(){
if(!form)return;
setSaving(true);
setMsg("");
try{
await updateConfiguracoes(form);
setMsg("Configurações salvas com sucesso 💐");
}catch(err){
setMsg((err as{response?:{data?:{error?:string}}})?.response?.data?.error??"Erro ao salvar.");
}finally{
setSaving(false);
}
}
const payload=form?resolvePixPayload({chave:form.pixChave,nome:form.pixNome,cidade:form.pixCidade,copiaECola:form.pixCopiaECola}):"";
return(
<AdminShell>
{loading||!form?(
<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-bloom-500"/></div>
):(
<div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
<Panel title="Dados do Pix">
<div className="space-y-4">
<TextArea
label="Pix Copia e Cola (sem valor)"
value={form.pixCopiaECola}
onChange={(e)=>setForm({...form,pixCopiaECola:e.target.value.trim()})}
className="font-mono text-xs"
/>
<p className="-mt-2 text-xs text-wine-500">Tem prioridade sobre a chave abaixo. Use o código gerado pelo banco (sem valor), assim a pessoa digita o valor no app.</p>
<Input label="Link de pagamento (opcional)" placeholder="https://nubank.com.br/cobrar/..." value={form.pixLink} onChange={(e)=>setForm({...form,pixLink:e.target.value})}/>
<Input label="Chave Pix" placeholder="CPF, e-mail, telefone ou chave aleatória" value={form.pixChave} onChange={(e)=>setForm({...form,pixChave:e.target.value})}/>
<div className="grid grid-cols-2 gap-3">
<Input label="Nome do recebedor" maxLength={25} value={form.pixNome} onChange={(e)=>setForm({...form,pixNome:e.target.value})}/>
<Input label="Cidade" maxLength={15} value={form.pixCidade} onChange={(e)=>setForm({...form,pixCidade:e.target.value})}/>
</div>
{msg&&<p className="text-sm text-wine-600">{msg}</p>}
<Button className="w-full" onClick={save} disabled={saving}>
{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}
Salvar
</Button>
</div>
</Panel>
<Panel title="Pré-visualização do QR Code">
{payload?(
<div className="flex flex-col items-center gap-4 text-center">
<div className="rounded-3xl bg-white p-4 ring-1 ring-bloom-100">
<QRCodeSVG value={payload} size={200} fgColor="#3a1227"/>
</div>
<p className="text-xs text-wine-500">Teste escaneando com o app do banco antes de divulgar: deve aparecer <strong>{form.pixNome}</strong> e pedir para digitar o valor.</p>
</div>
):<p className="py-10 text-center text-sm text-wine-400">Informe o código ou a chave Pix para gerar o QR Code.</p>}
</Panel>
</div>
)}
</AdminShell>
);
}
