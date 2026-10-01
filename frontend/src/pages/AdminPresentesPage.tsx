import{useMemo,useState}from"react";
import{Navigate}from"react-router-dom";
import{Eye,EyeOff,Loader2,Pencil,Plus,Search,Trash2,Undo2}from"lucide-react";
import{createPresente,deletePresente,getPresentesAdmin,updatePresente}from"../lib/api";
import type{PresenteAdmin}from"../lib/constants";
import{useAdminData}from"../hooks/admin";
import{AdminShell,Panel}from"../components/AdminShell";
import{Button,Input,Modal}from"../components/ui";
type Filtro="todos"|"escolhidos"|"disponiveis"|"inativos";
export function AdminPresentesPage(){
const{data,loading,reload,isAuthenticated}=useAdminData(getPresentesAdmin);
const itens=useMemo(()=>data??[],[data]);
const[q,setQ]=useState("");
const[filtro,setFiltro]=useState<Filtro>("todos");
const[novo,setNovo]=useState({nome:"",categoria:""});
const[editing,setEditing]=useState<PresenteAdmin|null>(null);
const[busy,setBusy]=useState(false);
const categorias=useMemo(()=>[...new Set(itens.map((i)=>i.categoria))],[itens]);
const filtered=useMemo(()=>{
const term=q.trim().toLowerCase();
return itens.filter((i)=>{
if(term&&!i.nome.toLowerCase().includes(term)&&!(i.convidado?.nome.toLowerCase().includes(term)))return false;
if(filtro==="escolhidos")return Boolean(i.convidadoId);
if(filtro==="disponiveis")return i.ativo&&!i.convidadoId;
if(filtro==="inativos")return!i.ativo;
return true;
});
},[itens,q,filtro]);
const ativos=itens.filter((i)=>i.ativo);
const escolhidos=ativos.filter((i)=>i.convidadoId).length;
if(!isAuthenticated)return<Navigate to="/admin" replace/>;
async function run(fn:()=>Promise<unknown>){
setBusy(true);
try{
await fn();
await reload();
}finally{
setBusy(false);
}
}
async function adicionar(){
if(novo.nome.trim().length<2||novo.categoria.trim().length<2)return;
await run(()=>createPresente({nome:novo.nome.trim(),categoria:novo.categoria.trim()}));
setNovo({nome:"",categoria:novo.categoria});
}
function liberar(i:PresenteAdmin){
if(!confirm(`Liberar "${i.nome}"? Ele deixará de estar reservado por ${i.convidado?.nome}.`))return;
void run(()=>updatePresente(i.id,{liberar:true}));
}
function remover(i:PresenteAdmin){
if(!confirm(`Excluir "${i.nome}" da lista?`))return;
void run(()=>deletePresente(i.id));
}
async function salvarEdicao(){
if(!editing)return;
await run(()=>updatePresente(editing.id,{nome:editing.nome,categoria:editing.categoria}));
setEditing(null);
}
return(
<AdminShell>
<section className="grid gap-4 sm:grid-cols-3">
<Panel><p className="text-xs uppercase tracking-wider text-wine-500">Itens ativos</p><p className="mt-1 font-display text-4xl font-semibold text-wine-800">{ativos.length}</p></Panel>
<Panel><p className="text-xs uppercase tracking-wider text-wine-500">Escolhidos</p><p className="mt-1 font-display text-4xl font-semibold text-bloom-600">{escolhidos}</p></Panel>
<Panel><p className="text-xs uppercase tracking-wider text-wine-500">Disponíveis</p><p className="mt-1 font-display text-4xl font-semibold text-leaf-600">{ativos.length-escolhidos}</p></Panel>
</section>
<Panel title="Adicionar item à lista">
<div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
<Input label="Item" placeholder="Ex.: Kit de toalhas de piscina" value={novo.nome} onChange={(e)=>setNovo({...novo,nome:e.target.value})}/>
<Input label="Categoria" list="categorias" placeholder="Cozinha" value={novo.categoria} onChange={(e)=>setNovo({...novo,categoria:e.target.value})}/>
<datalist id="categorias">{categorias.map((c)=><option key={c} value={c}/>)}</datalist>
<Button onClick={adicionar} disabled={busy||novo.nome.trim().length<2||novo.categoria.trim().length<2}><Plus className="h-4 w-4"/>Adicionar</Button>
</div>
</Panel>
<div className="flex flex-wrap items-center gap-3">
<div className="relative min-w-[220px] flex-1">
<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wine-400"/>
<input className="w-full rounded-full border border-bloom-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-bloom-100" placeholder="Buscar item ou convidado" value={q} onChange={(e)=>setQ(e.target.value)}/>
</div>
{([["todos","Todos"],["escolhidos","Escolhidos"],["disponiveis","Disponíveis"],["inativos","Ocultos"]] as const).map(([v,l])=>(
<button key={v} type="button" onClick={()=>setFiltro(v)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filtro===v?"bg-bloom-500 text-white":"bg-white text-wine-600 ring-1 ring-bloom-100 hover:bg-bloom-50"}`}>{l}</button>
))}
</div>
<div className="overflow-x-auto rounded-3xl border border-bloom-100 bg-white shadow-sm">
<table className="min-w-full text-left text-sm">
<thead className="border-b border-bloom-100 bg-bloom-50/60 text-xs uppercase tracking-wide text-wine-500">
<tr>
<th className="px-4 py-3">Item</th>
<th className="px-4 py-3">Categoria</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Quem vai levar</th>
<th className="px-4 py-3">Quando</th>
<th className="px-4 py-3"/>
</tr>
</thead>
<tbody>
{loading&&<tr><td colSpan={6} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-bloom-500"/></td></tr>}
{filtered.map((i)=>(
<tr key={i.id} className={`border-b border-bloom-50 last:border-0 ${i.ativo?"":"opacity-50"}`}>
<td className="px-4 py-3 font-medium text-wine-800">{i.nome}</td>
<td className="px-4 py-3 text-wine-500">{i.categoria}</td>
<td className="px-4 py-3">
{!i.ativo?<span className="rounded-full bg-wine-300/20 px-2.5 py-1 text-xs font-semibold text-wine-500">Oculto</span>
:i.convidadoId?<span className="rounded-full bg-bloom-100 px-2.5 py-1 text-xs font-semibold text-bloom-700">Escolhido</span>
:<span className="rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-semibold text-leaf-700">Disponível</span>}
</td>
<td className="px-4 py-3">
{i.convidado?(
<a className="text-bloom-600 hover:underline" href={`https://wa.me/55${i.convidado.telefone}`} target="_blank" rel="noreferrer">{i.convidado.nome}</a>
):<span className="text-wine-300">—</span>}
</td>
<td className="whitespace-nowrap px-4 py-3 text-wine-500">{i.reservadoEm?new Date(i.reservadoEm).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}):"—"}</td>
<td className="px-4 py-3">
<div className="flex justify-end gap-1">
{i.convidadoId&&<button type="button" disabled={busy} title="Liberar item" className="rounded-lg p-1.5 text-tangerine-600 hover:bg-tangerine-100" onClick={()=>liberar(i)}><Undo2 className="h-4 w-4"/></button>}
<button type="button" disabled={busy} title={i.ativo?"Ocultar do convite":"Mostrar no convite"} className="rounded-lg p-1.5 text-wine-500 hover:bg-bloom-50" onClick={()=>void run(()=>updatePresente(i.id,{ativo:!i.ativo}))}>{i.ativo?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
<button type="button" disabled={busy} title="Editar" className="rounded-lg p-1.5 text-wine-500 hover:bg-bloom-50" onClick={()=>setEditing({...i})}><Pencil className="h-4 w-4"/></button>
<button type="button" disabled={busy} title="Excluir" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" onClick={()=>remover(i)}><Trash2 className="h-4 w-4"/></button>
</div>
</td>
</tr>
))}
{!loading&&filtered.length===0&&<tr><td colSpan={6} className="py-12 text-center text-wine-400">Nenhum item encontrado.</td></tr>}
</tbody>
</table>
</div>
<Modal open={Boolean(editing)} onClose={()=>setEditing(null)} title="Editar item">
{editing&&(
<div className="space-y-4">
<Input label="Item" value={editing.nome} onChange={(e)=>setEditing({...editing,nome:e.target.value})}/>
<Input label="Categoria" list="categorias" value={editing.categoria} onChange={(e)=>setEditing({...editing,categoria:e.target.value})}/>
<Button className="w-full" onClick={salvarEdicao} disabled={busy}>{busy?"Salvando...":"Salvar"}</Button>
</div>
)}
</Modal>
</AdminShell>
);
}
