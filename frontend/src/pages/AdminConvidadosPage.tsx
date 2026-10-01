import{useMemo,useState}from"react";
import{Navigate}from"react-router-dom";
import{Download,FileSpreadsheet,Loader2,Pencil,Printer,Search,Trash2}from"lucide-react";
import{deleteConvidado,downloadExport,getConvidados,updateConvidado}from"../lib/api";
import{brl,type Convidado,type Presenca}from"../lib/constants";
import{useAdminData}from"../hooks/admin";
import{AdminShell}from"../components/AdminShell";
import{Button,Input,Modal,TextArea}from"../components/ui";
type FiltroPresenca="todos"|Presenca;
type FiltroPresente="todos"|"lista"|"pix"|"outro"|"nenhum";
type SortKey="createdAt"|"nome"|"total"|"pix";
const selectClass="rounded-full border border-bloom-100 bg-white px-4 py-2.5 text-sm text-wine-700 outline-none focus:ring-2 focus:ring-bloom-100";
function temPresente(c:Convidado){
return c.presentes.length>0||Boolean(c.pixValor)||Boolean(c.presenteOutro);
}
function formatTel(t:string){
if(t.length===11)return`(${t.slice(0,2)}) ${t.slice(2,7)}-${t.slice(7)}`;
if(t.length===10)return`(${t.slice(0,2)}) ${t.slice(2,6)}-${t.slice(6)}`;
return t;
}
export function AdminConvidadosPage(){
const{data,loading,reload,isAuthenticated}=useAdminData(getConvidados);
const rows=useMemo(()=>data??[],[data]);
const[q,setQ]=useState("");
const[presenca,setPresenca]=useState<FiltroPresenca>("todos");
const[presente,setPresente]=useState<FiltroPresente>("todos");
const[sort,setSort]=useState<`${SortKey}-${"asc"|"desc"}`>("createdAt-desc");
const[editing,setEditing]=useState<Convidado|null>(null);
const[saving,setSaving]=useState(false);
const[erro,setErro]=useState("");
const filtered=useMemo(()=>{
const term=q.trim().toLowerCase();
const digits=term.replace(/\D/g,"");
let list=rows.filter((r)=>!term||r.nome.toLowerCase().includes(term)||(digits&&r.telefone.includes(digits)));
if(presenca!=="todos")list=list.filter((r)=>r.presenca===presenca);
if(presente==="lista")list=list.filter((r)=>r.presentes.length>0);
if(presente==="pix")list=list.filter((r)=>r.pixValor);
if(presente==="outro")list=list.filter((r)=>r.presenteOutro);
if(presente==="nenhum")list=list.filter((r)=>!temPresente(r));
const[key,dir]=sort.split("-") as [SortKey,"asc"|"desc"];
const val=(r:Convidado)=>key==="nome"?r.nome.toLowerCase():key==="total"?r.adultos+r.criancas:key==="pix"?r.pixValor??0:r.createdAt;
return[...list].sort((a,b)=>{
const av=val(a),bv=val(b);
if(av<bv)return dir==="asc"?-1:1;
if(av>bv)return dir==="asc"?1:-1;
return 0;
});
},[rows,q,presenca,presente,sort]);
const totais=useMemo(()=>({
pessoas:filtered.filter((r)=>r.presenca==="SIM").reduce((s,r)=>s+r.adultos+r.criancas,0),
pix:filtered.reduce((s,r)=>s+(r.pixValor??0),0),
}),[filtered]);
if(!isAuthenticated)return<Navigate to="/admin" replace/>;
async function handleDelete(r:Convidado){
if(!confirm(`Excluir a resposta de ${r.nome}? Os itens da lista escolhidos por essa pessoa voltarão a ficar disponíveis.`))return;
await deleteConvidado(r.id);
await reload();
}
async function handleSave(){
if(!editing)return;
setSaving(true);
setErro("");
try{
await updateConvidado(editing.id,{
nome:editing.nome,
telefone:editing.telefone,
presenca:editing.presenca,
adultos:editing.adultos,
criancas:editing.criancas,
mensagem:editing.mensagem,
presenteOutro:editing.presenteOutro||null,
pixValor:editing.pixValor||null,
});
setEditing(null);
await reload();
}catch(err){
setErro((err as{response?:{data?:{error?:string}}})?.response?.data?.error??"Erro ao salvar");
}finally{
setSaving(false);
}
}
return(
<AdminShell>
<div className="no-print flex flex-wrap items-center gap-3">
<div className="relative min-w-[220px] flex-1">
<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wine-400"/>
<input className="w-full rounded-full border border-bloom-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-bloom-100" placeholder="Buscar por nome ou telefone" value={q} onChange={(e)=>setQ(e.target.value)}/>
</div>
<select className={selectClass} value={presenca} onChange={(e)=>setPresenca(e.target.value as FiltroPresenca)}>
<option value="todos">Presença: todos</option>
<option value="SIM">Vão</option>
<option value="NAO">Não vão</option>
</select>
<select className={selectClass} value={presente} onChange={(e)=>setPresente(e.target.value as FiltroPresente)}>
<option value="todos">Presente: todos</option>
<option value="lista">Item da lista</option>
<option value="pix">Pix</option>
<option value="outro">Outro presente</option>
<option value="nenhum">Sem presente</option>
</select>
<select className={selectClass} value={sort} onChange={(e)=>setSort(e.target.value as typeof sort)}>
<option value="createdAt-desc">Mais recentes</option>
<option value="createdAt-asc">Mais antigos</option>
<option value="nome-asc">Nome A-Z</option>
<option value="nome-desc">Nome Z-A</option>
<option value="total-desc">Mais pessoas</option>
<option value="pix-desc">Maior Pix</option>
</select>
<Button variant="outline" className="!px-4" onClick={()=>downloadExport("csv")}><Download className="h-4 w-4"/>CSV</Button>
<Button variant="outline" className="!px-4" onClick={()=>downloadExport("excel")}><FileSpreadsheet className="h-4 w-4"/>Excel</Button>
<Button variant="secondary" className="!px-4" onClick={()=>window.print()}><Printer className="h-4 w-4"/>Imprimir</Button>
</div>
<p className="text-sm text-wine-500">
{filtered.length} resposta(s) · {totais.pessoas} pessoa(s) confirmadas · {brl(totais.pix)} em Pix
</p>
<div className="overflow-x-auto rounded-3xl border border-bloom-100 bg-white shadow-sm">
<table className="min-w-full text-left text-sm">
<thead className="border-b border-bloom-100 bg-bloom-50/60 text-xs uppercase tracking-wide text-wine-500">
<tr>
<th className="px-4 py-3">Nome</th>
<th className="px-4 py-3">WhatsApp</th>
<th className="px-4 py-3">Presença</th>
<th className="px-4 py-3 text-center">Adultos</th>
<th className="px-4 py-3 text-center">Crianças</th>
<th className="px-4 py-3">Presente</th>
<th className="px-4 py-3 text-right">Pix</th>
<th className="px-4 py-3">Recado</th>
<th className="px-4 py-3">Data</th>
<th className="no-print px-4 py-3"/>
</tr>
</thead>
<tbody>
{loading&&(
<tr><td colSpan={10} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-bloom-500"/></td></tr>
)}
{filtered.map((r)=>(
<tr key={r.id} className="border-b border-bloom-50 align-top last:border-0">
<td className="px-4 py-3 font-medium text-wine-800">{r.nome}</td>
<td className="whitespace-nowrap px-4 py-3">
<a className="text-bloom-600 hover:underline" href={`https://wa.me/55${r.telefone}`} target="_blank" rel="noreferrer">{formatTel(r.telefone)}</a>
</td>
<td className="px-4 py-3">
<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.presenca==="SIM"?"bg-leaf-100 text-leaf-700":"bg-wine-300/20 text-wine-600"}`}>{r.presenca==="SIM"?"Vai":"Não vai"}</span>
</td>
<td className="px-4 py-3 text-center">{r.adultos}</td>
<td className="px-4 py-3 text-center">{r.criancas}</td>
<td className="min-w-[220px] px-4 py-3">
<div className="flex flex-wrap gap-1">
{r.presentes.map((p)=><span key={p.id} className="rounded-full bg-bloom-50 px-2 py-0.5 text-xs text-bloom-700">🎁 {p.nome}</span>)}
{r.presenteOutro&&<span className="rounded-full bg-marigold-100 px-2 py-0.5 text-xs text-wine-700">✨ {r.presenteOutro}</span>}
{!temPresente(r)&&<span className="text-wine-300">—</span>}
</div>
</td>
<td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-tangerine-600">{r.pixValor?brl(r.pixValor):<span className="font-normal text-wine-300">—</span>}</td>
<td className="max-w-[220px] px-4 py-3 text-wine-600"><p className="line-clamp-2" title={r.mensagem??""}>{r.mensagem??"—"}</p></td>
<td className="whitespace-nowrap px-4 py-3 text-wine-500">{new Date(r.createdAt).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}</td>
<td className="no-print px-4 py-3">
<div className="flex gap-1">
<button type="button" className="rounded-lg p-1.5 text-wine-500 hover:bg-bloom-50" onClick={()=>{setErro("");setEditing({...r});}} aria-label="Editar"><Pencil className="h-4 w-4"/></button>
<button type="button" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" onClick={()=>handleDelete(r)} aria-label="Excluir"><Trash2 className="h-4 w-4"/></button>
</div>
</td>
</tr>
))}
{!loading&&filtered.length===0&&(
<tr><td colSpan={10} className="px-4 py-12 text-center text-wine-400">Nenhuma resposta encontrada.</td></tr>
)}
</tbody>
</table>
</div>
<Modal open={Boolean(editing)} onClose={()=>setEditing(null)} title="Editar resposta">
{editing&&(
<div className="space-y-4">
<Input label="Nome" value={editing.nome} onChange={(e)=>setEditing({...editing,nome:e.target.value})}/>
<Input label="Telefone" value={editing.telefone} onChange={(e)=>setEditing({...editing,telefone:e.target.value})}/>
<label className="block space-y-1.5">
<span className="text-sm font-medium text-wine-700">Presença</span>
<select className={`${selectClass} w-full !rounded-2xl`} value={editing.presenca} onChange={(e)=>setEditing({...editing,presenca:e.target.value as Presenca})}>
<option value="SIM">Vai</option>
<option value="NAO">Não vai</option>
</select>
</label>
<div className="grid grid-cols-2 gap-3">
<Input label="Adultos" type="number" min={0} value={editing.adultos} onChange={(e)=>setEditing({...editing,adultos:Number(e.target.value)})}/>
<Input label="Crianças" type="number" min={0} value={editing.criancas} onChange={(e)=>setEditing({...editing,criancas:Number(e.target.value)})}/>
</div>
<Input label="Valor do Pix (R$)" type="number" min={0} step="0.01" value={editing.pixValor??""} onChange={(e)=>setEditing({...editing,pixValor:e.target.value===""?null:Number(e.target.value)})}/>
<Input label="Outro presente" value={editing.presenteOutro??""} onChange={(e)=>setEditing({...editing,presenteOutro:e.target.value})}/>
{editing.presentes.length>0&&(
<p className="text-xs text-wine-500">Itens da lista: {editing.presentes.map((p)=>p.nome).join(", ")} — para liberar, use a aba “Lista de presentes”.</p>
)}
<TextArea label="Recado" value={editing.mensagem??""} onChange={(e)=>setEditing({...editing,mensagem:e.target.value})}/>
{erro&&<p className="text-sm text-red-500">{erro}</p>}
<Button className="w-full" onClick={handleSave} disabled={saving}>{saving?"Salvando...":"Salvar"}</Button>
</div>
)}
</Modal>
</AdminShell>
);
}
