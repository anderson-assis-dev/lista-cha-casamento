import{useEffect,useMemo,useState}from"react";
import{useForm}from"react-hook-form";
import{z}from"zod";
import{zodResolver}from"@hookform/resolvers/zod";
import confetti from"canvas-confetti";
import{QRCodeSVG}from"qrcode.react";
import{ArrowLeft,Check,Copy,Crown,ExternalLink,Gift,HeartHandshake,Loader2,QrCode,Search,Sparkles}from"lucide-react";
import{Button,Input,Modal,TextArea}from"./ui";
import{apiError,createConvidado,getPresentes,informarOutro,registrarPix,reservarPresentes}from"../lib/api";
import{maskPixKey,resolvePixPayload}from"../lib/pix";
import{CATEGORIA_PADRINHOS,PIX_SUGESTOES,brl,type Convidado,type PixConfig,type Presenca,type PresentePublico}from"../lib/constants";
import{saveGuest,type GuestRef}from"../hooks";
const schema=z.object({
nome:z.string().trim().min(2,"Conta pra gente seu nome"),
telefone:z.string().refine((v)=>v.replace(/\D/g,"").length>=10,"Informe um WhatsApp com DDD"),
adultos:z.coerce.number().int().min(0).max(30),
criancas:z.coerce.number().int().min(0).max(30),
mensagem:z.string().max(500).optional(),
});
type FormData=z.infer<typeof schema>;
export type FlowStep="form"|"escolha"|"lista"|"padrinhos"|"outro"|"pix-valor"|"pix-qr"|"fim";
const CONFETTI=["#e01e6c","#f8a7a3","#f26b1d","#fbbf24","#69a05b"];
const MAX_ITENS=5;
function formatPhone(v:string){
const d=v.replace(/\D/g,"").slice(0,11);
if(d.length<=2)return d;
if(d.length<=7)return`(${d.slice(0,2)}) ${d.slice(2)}`;
return`(${d.slice(0,2)}) ${d.slice(2,d.length-4)}-${d.slice(-4)}`;
}
export function PresencaFlow({open,onClose,guest,startAt="form",onGuest}:{
open:boolean;
onClose:()=>void;
guest:GuestRef|null;
startAt?:FlowStep;
onGuest:(g:GuestRef|null)=>void;
}){
const[step,setStep]=useState<FlowStep>(startAt);
const[presenca,setPresenca]=useState<Presenca>("SIM");
const[convidado,setConvidado]=useState<GuestRef|null>(guest);
const[loading,setLoading]=useState(false);
const[error,setError]=useState("");
const[presentes,setPresentes]=useState<PresentePublico[]>([]);
const[categoria,setCategoria]=useState("Todos");
const[busca,setBusca]=useState("");
const[selecionados,setSelecionados]=useState<string[]>([]);
const[outro,setOutro]=useState("");
const[valor,setValor]=useState("");
const[pix,setPix]=useState<PixConfig|null>(null);
const[resumo,setResumo]=useState<string[]>([]);
const[copiado,setCopiado]=useState(false);
const{register,handleSubmit,formState:{errors},reset,setValue,watch}=useForm<FormData>({
resolver:zodResolver(schema),
defaultValues:{adultos:1,criancas:0},
});
useEffect(()=>{
if(open){
setStep(startAt);
setConvidado(guest);
setError("");
}
},[open,startAt,guest]);
const ehLista=step==="lista"||step==="padrinhos";
useEffect(()=>{
if(step!=="lista"&&step!=="padrinhos")return;
setCategoria("Todos");
setBusca("");
setSelecionados([]);
setLoading(true);
getPresentes().then(setPresentes).catch(()=>setError("Não conseguimos carregar a lista agora.")).finally(()=>setLoading(false));
},[step]);
const daLista=useMemo(()=>presentes.filter((p)=>(p.categoria===CATEGORIA_PADRINHOS)===(step==="padrinhos")),[presentes,step]);
const categorias=useMemo(()=>["Todos",...new Set(daLista.map((p)=>p.categoria))],[daLista]);
const visiveis=useMemo(()=>{
const q=busca.trim().toLowerCase();
return daLista.filter((p)=>(categoria==="Todos"||p.categoria===categoria)&&(!q||p.nome.toLowerCase().includes(q)));
},[daLista,categoria,busca]);
const disponiveis=daLista.filter((p)=>!p.reservado).length;
function resetAll(){
setStep("form");
setError("");
setSelecionados([]);
setOutro("");
setValor("");
setPix(null);
setResumo([]);
setBusca("");
setCategoria("Todos");
setPresenca("SIM");
reset({nome:"",telefone:"",adultos:1,criancas:0,mensagem:""});
}
function handleClose(){
resetAll();
onClose();
}
function celebrate(){
confetti({particleCount:140,spread:80,origin:{y:0.7},colors:CONFETTI});
}
function handleGuestError(err:unknown,fallback:string){
const status=(err as{response?:{status?:number}})?.response?.status;
if(status===404){
saveGuest(null);
onGuest(null);
setConvidado(null);
setStep("form");
setError("Não encontramos sua confirmação. Pode preencher de novo, por favor?");
return;
}
setError(apiError(err,fallback));
}
async function onSubmit(data:FormData){
setLoading(true);
setError("");
try{
const res=await createConvidado({...data,presenca,mensagem:data.mensagem||undefined});
const ref={id:res.id,nome:res.nome.split(" ")[0],presenca:res.presenca};
setConvidado(ref);
saveGuest(ref);
onGuest(ref);
if(presenca==="SIM")celebrate();
setStep("escolha");
}catch(err){
setError(apiError(err,"Não foi possível enviar agora. Tente novamente em instantes."));
}finally{
setLoading(false);
}
}
function done(c:Convidado,texto:string){
setResumo((r)=>[...r,texto]);
setConvidado({id:c.id,nome:c.nome.split(" ")[0],presenca:c.presenca});
celebrate();
setStep("fim");
}
async function confirmarItens(){
if(!convidado||selecionados.length===0)return;
setLoading(true);
setError("");
try{
const c=await reservarPresentes(convidado.id,selecionados);
const nomes=presentes.filter((p)=>selecionados.includes(p.id)).map((p)=>p.nome);
setSelecionados([]);
done(c,nomes.join(", "));
}catch(err){
handleGuestError(err,"Não foi possível reservar agora.");
setSelecionados([]);
getPresentes().then(setPresentes).catch(()=>{});
}finally{
setLoading(false);
}
}
async function confirmarOutro(){
if(!convidado||outro.trim().length<2)return;
setLoading(true);
setError("");
try{
const c=await informarOutro(convidado.id,outro.trim());
done(c,outro.trim());
}catch(err){
handleGuestError(err,"Não foi possível salvar agora.");
}finally{
setLoading(false);
}
}
const valorNumero=Number(valor.replace(/\./g,"").replace(",","."));
async function confirmarValor(){
if(!convidado||!(valorNumero>=1))return;
setLoading(true);
setError("");
try{
const res=await registrarPix(convidado.id,valorNumero);
setPix(res.pix);
setResumo((r)=>[...r,`Pix de ${brl(valorNumero)}`]);
setStep("pix-qr");
}catch(err){
handleGuestError(err,"Não foi possível registrar agora.");
}finally{
setLoading(false);
}
}
const payload=pix?resolvePixPayload(pix):"";
async function copiar(text:string){
await navigator.clipboard.writeText(text);
setCopiado(true);
setTimeout(()=>setCopiado(false),2500);
}
function toggleItem(id:string){
setSelecionados((s)=>s.includes(id)?s.filter((x)=>x!==id):s.length>=MAX_ITENS?s:[...s,id]);
}
const titles:Partial<Record<FlowStep,string>>={
form:"Confirme sua presença",
lista:"Lista de presentes",
padrinhos:"Lista dos padrinhos",
outro:"Outro presente",
"pix-valor":"Presente via Pix",
"pix-qr":"Seu Pix 💛",
};
const back=(to:FlowStep)=>(
<button type="button" onClick={()=>{setError("");setStep(to);}} className="mb-3 inline-flex items-center gap-1 text-sm text-wine-500 hover:text-bloom-600">
<ArrowLeft className="h-4 w-4"/>Voltar
</button>
);
const telefone=register("telefone");
return(
<Modal open={open} onClose={handleClose} title={titles[step]} wide={ehLista}>
{step==="form"&&(
<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
<p className="text-sm leading-relaxed text-wine-600">Queremos preparar tudo com muito carinho, então sua resposta faz toda a diferença pra gente. 🌷</p>
<Input label="Seu nome completo" placeholder="Como você se chama?" autoComplete="name" error={errors.nome?.message} {...register("nome")}/>
<Input
label="WhatsApp"
placeholder="(71) 99999-9999"
inputMode="tel"
autoComplete="tel"
error={errors.telefone?.message}
{...telefone}
value={formatPhone(watch("telefone")??"")}
onChange={(e)=>setValue("telefone",formatPhone(e.target.value),{shouldValidate:Boolean(errors.telefone)})}
/>
<div>
<span className="text-sm font-medium text-wine-700">Você vai com a gente?</span>
<div className="mt-1.5 grid grid-cols-2 gap-3">
{([["SIM","Sim, estarei lá! 🥳"],["NAO","Infelizmente não poderei 😢"]] as const).map(([v,label])=>(
<button
key={v}
type="button"
onClick={()=>setPresenca(v)}
className={`rounded-2xl border-2 px-3 py-3 text-sm font-medium transition ${presenca===v?(v==="SIM"?"border-bloom-400 bg-bloom-50 text-bloom-700":"border-wine-300 bg-wine-300/10 text-wine-700"):"border-bloom-100 bg-white/70 text-wine-500 hover:border-bloom-200"}`}
>
{label}
</button>
))}
</div>
</div>
{presenca==="SIM"&&(
<div className="grid grid-cols-2 gap-3">
<Input label="Adultos (com você)" type="number" min={1} max={30} error={errors.adultos?.message} {...register("adultos")}/>
<Input label="Crianças" type="number" min={0} max={30} error={errors.criancas?.message} {...register("criancas")}/>
</div>
)}
<TextArea label="Deixe um recadinho pro casal (opcional)" placeholder="Uma palavra de carinho, uma bênção para o novo lar..." error={errors.mensagem?.message} {...register("mensagem")}/>
{error&&<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
<Button type="submit" className="w-full" disabled={loading}>
{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}
{presenca==="SIM"?"Confirmar presença":"Enviar resposta"}
</Button>
</form>
)}
{step==="escolha"&&(
<div className="space-y-5">
<div className="text-center">
<div className="bg-bouquet mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg shadow-bloom-500/30">
{(convidado?.presenca??presenca)==="NAO"?<HeartHandshake className="h-8 w-8"/>:<Check className="h-8 w-8"/>}
</div>
<h3 className="mt-4 font-display text-3xl font-semibold text-wine-800">
{convidado?`Obrigado, ${convidado.nome}!`:"Obrigado!"}
</h3>
<p className="mt-2 text-sm leading-relaxed text-wine-600">
{(convidado?.presenca??presenca)==="NAO"
?"Vamos sentir sua falta, mas sabemos que você estará com a gente no coração. 💛"
:"Sua presença já é o nosso maior presente. Mal podemos esperar pra celebrar com você!"}
</p>
</div>
<div className="rounded-3xl border border-bloom-100 bg-gradient-to-br from-bloom-50 via-white to-marigold-100/60 p-5">
<p className="font-display text-2xl font-semibold text-wine-800">Quer nos ajudar a montar nosso cantinho?</p>
<p className="mt-1 text-sm leading-relaxed text-wine-600">Cada detalhe da nossa casa vai ter um pouquinho de quem a gente ama. Escolha o jeito que for melhor pra você:</p>
<div className="mt-4 space-y-3">
<OptionCard icon={<Gift className="h-5 w-5"/>} tone="bloom" title="Escolher da lista" text="Sugestões pra casa — cada item só pode ser escolhido por uma pessoa." onClick={()=>setStep("lista")}/>
<OptionCard icon={<Crown className="h-5 w-5"/>} tone="leaf" title="Sou padrinho ou madrinha" text="Uma lista especial, separada só para os nossos padrinhos." onClick={()=>setStep("padrinhos")}/>
<OptionCard icon={<QrCode className="h-5 w-5"/>} tone="tangerine" title="Presentear com Pix" text="Prático e rápido: vai direto para o que ainda falta no nosso lar." onClick={()=>setStep("pix-valor")}/>
<OptionCard icon={<Sparkles className="h-5 w-5"/>} tone="marigold" title="Levar outro presente" text="Pensou em algo especial que não está na lista? Conta pra gente!" onClick={()=>setStep("outro")}/>
</div>
</div>
<Button variant="ghost" className="w-full" onClick={handleClose}>Por enquanto, só levo meu abraço 🤗</Button>
</div>
)}
{ehLista&&(
<div className="space-y-4">
{back("escolha")}
{step==="padrinhos"&&<p className="rounded-2xl bg-leaf-50 px-4 py-3 ring-1 ring-leaf-100 text-sm leading-relaxed text-wine-700">Padrinhos e madrinhas, que alegria ter vocês ao nosso lado! 💛 Esta lista foi pensada especialmente pra vocês.</p>}
<p className="text-sm text-wine-600">Toque para escolher até {MAX_ITENS} itens. Os que já foram escolhidos aparecem riscados pra ninguém repetir. 😉</p>
<div className="relative">
<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wine-400"/>
<input value={busca} onChange={(e)=>setBusca(e.target.value)} placeholder="Buscar item..." className="w-full rounded-full border border-bloom-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-bloom-100"/>
</div>
<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
{categorias.length>2&&categorias.map((c)=>(
<button key={c} type="button" onClick={()=>setCategoria(c)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${categoria===c?"bg-bloom-500 text-white":"bg-bloom-50 text-wine-600 hover:bg-bloom-100"}`}>{c}</button>
))}
</div>
{loading&&presentes.length===0?(
<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-bloom-500"/></div>
):(
<div className="grid max-h-[46vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
{visiveis.map((p)=>{
const sel=selecionados.includes(p.id);
return(
<button
key={p.id}
type="button"
disabled={p.reservado||loading}
onClick={()=>toggleItem(p.id)}
className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${p.reservado?"cursor-not-allowed border-transparent bg-wine-300/10 opacity-60":sel?"border-bloom-400 bg-bloom-50 shadow-sm":"border-bloom-100 bg-white hover:border-bloom-300"}`}
>
<span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${sel?"border-bloom-500 bg-bloom-500 text-white":"border-bloom-200"}`}>
{sel&&<Check className="h-3.5 w-3.5"/>}
</span>
<span className="min-w-0">
<span className={`block text-sm font-medium ${p.reservado?"text-wine-400 line-through":"text-wine-800"}`}>{p.nome}</span>
<span className="block text-xs text-wine-400">{p.reservado?"Já escolhido 💐":p.categoria}</span>
</span>
</button>
);
})}
{visiveis.length===0&&<p className="col-span-full py-6 text-center text-sm text-wine-400">Nenhum item encontrado.</p>}
</div>
)}
<p className="text-xs text-wine-400">{disponiveis} de {daLista.length} itens ainda disponíveis.</p>
{error&&<p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>}
<div className="sticky bottom-0 -mx-6 -mb-6 border-t border-bloom-100 bg-cream/95 px-6 py-4 backdrop-blur">
<Button className="w-full" onClick={confirmarItens} disabled={loading||selecionados.length===0}>
{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Gift className="h-4 w-4"/>}
{selecionados.length?`Vou levar ${selecionados.length===1?"este item":`estes ${selecionados.length} itens`}`:"Selecione um item"}
</Button>
</div>
</div>
)}
{step==="outro"&&(
<div className="space-y-4">
{back("escolha")}
<p className="text-sm leading-relaxed text-wine-600">Amamos surpresas! Só conta pra gente o que você pensou em levar, assim evitamos presentes repetidos. 🎁</p>
<TextArea label="O que você pretende levar?" placeholder="Ex.: um kit de plantinhas para a varanda" value={outro} maxLength={200} onChange={(e)=>setOutro(e.target.value)}/>
{error&&<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
<Button className="w-full" onClick={confirmarOutro} disabled={loading||outro.trim().length<2}>
{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}
Confirmar presente
</Button>
</div>
)}
{step==="pix-valor"&&(
<div className="space-y-4">
{back("escolha")}
<p className="text-sm leading-relaxed text-wine-600">
Que carinho! 💛 Pra gente guardar com gratidão quem ajudou a montar nosso lar, conta qual valor você pretende enviar.
Logo depois mostramos o QR Code — ele é <strong>sem valor fixo</strong>, você só digita no app do seu banco.
</p>
<div className="grid grid-cols-3 gap-2">
{PIX_SUGESTOES.map((v)=>(
<button key={v} type="button" onClick={()=>setValor(String(v))} className={`rounded-2xl border-2 py-3 text-sm font-semibold transition ${valorNumero===v?"border-tangerine-400 bg-tangerine-100 text-tangerine-600":"border-bloom-100 bg-white text-wine-700 hover:border-tangerine-300"}`}>
{brl(v).replace(",00","")}
</button>
))}
</div>
<label className="block space-y-1.5">
<span className="text-sm font-medium text-wine-700">Ou outro valor</span>
<div className="flex items-center rounded-2xl border border-bloom-100 bg-white/80 px-4 focus-within:ring-2 focus-within:ring-bloom-100">
<span className="text-wine-400">R$</span>
<input inputMode="decimal" placeholder="0,00" value={valor} onChange={(e)=>setValor(e.target.value.replace(/[^\d,.]/g,""))} className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-wine-900 outline-none"/>
</div>
</label>
{error&&<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
<Button className="w-full" onClick={confirmarValor} disabled={loading||!(valorNumero>=1)}>
{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<QrCode className="h-4 w-4"/>}
Ver QR Code{valorNumero>=1?` (${brl(valorNumero)})`:""}
</Button>
</div>
)}
{step==="pix-qr"&&pix&&(
<div className="space-y-5 text-center">
{payload?(
<>
<p className="text-sm leading-relaxed text-wine-600">
Abra o app do seu banco, escaneie o QR Code ou use o Pix Copia e Cola, e digite o valor de <strong className="text-bloom-700">{brl(valorNumero)}</strong>.
</p>
<div className="mx-auto w-fit rounded-3xl bg-white p-5 shadow-lg shadow-bloom-900/10 ring-1 ring-bloom-100">
<QRCodeSVG value={payload} size={200} fgColor="#3a1227" bgColor="#ffffff" level="M"/>
</div>
<div className="rounded-2xl bg-white/80 p-4 text-left ring-1 ring-bloom-100">
<p className="text-xs uppercase tracking-wider text-wine-400">Recebedor</p>
<p className="mt-1 font-medium text-wine-800">{pix.nome}</p>
{pix.chave&&<p className="mt-1 text-xs text-wine-500">Chave: {maskPixKey(pix.chave)}</p>}
</div>
<Button variant="outline" className="w-full" onClick={()=>copiar(payload)}>
<Copy className="h-4 w-4"/>{copiado?"Copiado! Agora é só colar no app 💛":"Copiar Pix Copia e Cola"}
</Button>
{pix.link&&(
<a href={pix.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-bloom-600 hover:underline">
<ExternalLink className="h-4 w-4"/>Abrir página de pagamento do Nubank
</a>
)}
</>
):(
<p className="rounded-2xl bg-marigold-100 px-4 py-4 text-sm leading-relaxed text-wine-700">
Registramos sua intenção de {brl(valorNumero)} com muito carinho! A chave Pix do casal será liberada aqui em breve — volte mais tarde ou peça ao João ou à Ellen. 💛
</p>
)}
<Button className="w-full" onClick={()=>{celebrate();setStep("fim");}}>
<Check className="h-4 w-4"/>Pronto, já enviei
</Button>
</div>
)}
{step==="fim"&&(
<div className="space-y-5 text-center">
<div className="bg-bouquet mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg shadow-bloom-500/30">
<Gift className="h-8 w-8"/>
</div>
<h3 className="font-display text-3xl font-semibold text-wine-800">Muito obrigado pelo carinho{convidado?`, ${convidado.nome}`:""}!</h3>
<p className="text-sm leading-relaxed text-wine-600">Cada vez que usarmos esse presente, vamos lembrar de você. Que alegria ter você fazendo parte do nosso novo lar! 🏡</p>
{resumo.length>0&&(
<div className="rounded-2xl bg-white/80 p-4 text-left ring-1 ring-bloom-100">
<p className="text-xs uppercase tracking-wider text-wine-400">Registramos</p>
<ul className="mt-2 space-y-1 text-sm text-wine-800">
{resumo.map((r,i)=><li key={i}>🌸 {r}</li>)}
</ul>
</div>
)}
<div className="grid gap-2">
<Button className="w-full" onClick={handleClose}>Fechar</Button>
<Button variant="ghost" className="w-full" onClick={()=>setStep("escolha")}>Quero presentear com mais alguma coisa</Button>
</div>
</div>
)}
</Modal>
);
}
function OptionCard({icon,title,text,onClick,tone}:{icon:React.ReactNode;title:string;text:string;onClick:()=>void;tone:"bloom"|"tangerine"|"marigold"|"leaf"}){
const toneClass={bloom:"bg-bloom-500",tangerine:"bg-tangerine-500",marigold:"bg-marigold-400",leaf:"bg-leaf-500"}[tone];
return(
<button type="button" onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl border border-white bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
<span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${toneClass}`}>{icon}</span>
<span>
<span className="block font-semibold text-wine-800">{title}</span>
<span className="block text-xs leading-snug text-wine-500">{text}</span>
</span>
</button>
);
}
