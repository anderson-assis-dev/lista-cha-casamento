import{Navigate}from"react-router-dom";
import{
Bar,BarChart,CartesianGrid,ComposedChart,Legend,Line,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis,
}from"recharts";
import{Loader2,MessageCircleHeart,QrCode}from"lucide-react";
import{getDashboard}from"../lib/api";
import{brl}from"../lib/constants";
import{useAdminData}from"../hooks/admin";
import{AdminShell,Panel}from"../components/AdminShell";
import{StatCard}from"../components/ui";
const TIPO_CORES:Record<string,string>={
"Item da lista":"#e01e6c",
"Pix":"#f26b1d",
"Outro presente":"#fbbf24",
"Sem presente":"#d9a3b8",
};
const dia=(d:string)=>d.slice(8,10)+"/"+d.slice(5,7);
export function AdminDashboardPage(){
const{data:dash,loading,isAuthenticated}=useAdminData(getDashboard);
if(!isAuthenticated)return<Navigate to="/admin" replace/>;
if(loading||!dash){
return<AdminShell><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-bloom-500"/></div></AdminShell>;
}
const pctLista=dash.lista.total?Math.round((dash.lista.reservados/dash.lista.total)*100):0;
const pctConfirm=dash.totalRespostas?Math.round((dash.confirmados/dash.totalRespostas)*100):0;
const tipos=dash.porTipo.filter((t)=>t.total>0).map((t)=>({...t,fill:TIPO_CORES[t.tipo]}));
return(
<AdminShell>
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<StatCard label="Respostas" value={dash.totalRespostas} hint={`${pctConfirm}% confirmaram presença`}/>
<StatCard label="Vão ao chá" value={dash.confirmados} hint={`${dash.naoVao} não poderão ir`} accent="leaf"/>
<StatCard label="Total de pessoas" value={dash.totalPessoas} hint={`${dash.totalAdultos} adultos · ${dash.totalCriancas} crianças`} accent="coral"/>
<StatCard label="Não vão" value={dash.naoVao} accent="marigold"/>
</section>
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<StatCard label="Total em Pix" value={brl(dash.pix.total)} hint={`${dash.pix.quantidade} pessoa(s) · média ${brl(dash.pix.media)}`} accent="tangerine"/>
<StatCard label="Itens escolhidos" value={`${dash.lista.reservados}/${dash.lista.total}`} hint={`${dash.lista.disponiveis} ainda disponíveis`}/>
<StatCard label="Outros presentes" value={dash.porTipo.find((t)=>t.tipo==="Outro presente")?.total??0} accent="marigold"/>
<StatCard label="Sem presente (ainda)" value={dash.porTipo.find((t)=>t.tipo==="Sem presente")?.total??0} hint="Podem voltar pelo convite e escolher" accent="coral"/>
</section>
<Panel title="Progresso da lista de presentes" right={<span className="text-sm font-semibold text-bloom-600">{pctLista}%</span>}>
<div className="h-3 overflow-hidden rounded-full bg-bloom-50">
<div className="bg-bouquet h-full rounded-full transition-all" style={{width:`${pctLista}%`}}/>
</div>
</Panel>
<section className="grid gap-6 lg:grid-cols-3">
<Panel title="Como estão presenteando">
<div className="h-64">
{tipos.length?(
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie data={tipos} dataKey="total" nameKey="tipo" innerRadius={50} outerRadius={85} paddingAngle={3} isAnimationActive={false}/>
<Tooltip/>
<Legend/>
</PieChart>
</ResponsiveContainer>
):<Empty/>}
</div>
</Panel>
<Panel title="Lista por categoria" className="lg:col-span-2">
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={dash.porCategoria} margin={{left:-20}}>
<CartesianGrid strokeDasharray="3 3" stroke="#ffdbe8" vertical={false}/>
<XAxis dataKey="categoria" tick={{fontSize:11}} interval={0}/>
<YAxis allowDecimals={false}/>
<Tooltip/>
<Legend/>
<Bar dataKey="reservados" name="Escolhidos" fill="#e01e6c" radius={[6,6,0,0]} isAnimationActive={false}/>
<Bar dataKey="total" name="Total" fill="#fdcac4" radius={[6,6,0,0]} isAnimationActive={false}/>
</BarChart>
</ResponsiveContainer>
</div>
</Panel>
</section>
<Panel title="Respostas e Pix por dia">
<div className="h-64">
{dash.porDia.length?(
<ResponsiveContainer width="100%" height="100%">
<ComposedChart data={dash.porDia.map((d)=>({...d,data:dia(d.data)}))}>
<CartesianGrid strokeDasharray="3 3" stroke="#ffdbe8" vertical={false}/>
<XAxis dataKey="data"/>
<YAxis yAxisId="r" allowDecimals={false}/>
<YAxis yAxisId="p" orientation="right" tickFormatter={(v)=>`R$${v}`}/>
<Tooltip formatter={(v,name)=>name==="Pix (R$)"?brl(Number(v)):v}/>
<Legend/>
<Bar yAxisId="r" maxBarSize={56} dataKey="respostas" name="Respostas" fill="#f8a7a3" radius={[6,6,0,0]} isAnimationActive={false}/>
<Line yAxisId="p" type="monotone" dataKey="pix" name="Pix (R$)" stroke="#f26b1d" strokeWidth={2.5} dot isAnimationActive={false}/>
</ComposedChart>
</ResponsiveContainer>
):<Empty/>}
</div>
</Panel>
<section className="grid gap-6 lg:grid-cols-2">
<Panel title="Últimos Pix informados">
{dash.ultimosPix.length?(
<ul className="divide-y divide-bloom-50">
{dash.ultimosPix.map((p)=>(
<li key={p.id} className="flex items-center justify-between py-3">
<span className="flex items-center gap-3">
<span className="flex h-9 w-9 items-center justify-center rounded-full bg-tangerine-100 text-tangerine-600"><QrCode className="h-4 w-4"/></span>
<span>
<span className="block font-medium text-wine-800">{p.nome}</span>
<span className="block text-xs text-wine-400">{new Date(p.em).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}</span>
</span>
</span>
<span className="font-semibold text-tangerine-600">{brl(p.valor)}</span>
</li>
))}
</ul>
):<p className="py-6 text-center text-sm text-wine-400">Nenhum Pix informado ainda.</p>}
</Panel>
<Panel title="Recadinhos para o casal">
{dash.mensagens.length?(
<ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
{dash.mensagens.map((m)=>(
<li key={m.id} className="rounded-2xl bg-bloom-50/70 p-4">
<p className="flex items-center gap-2 text-sm font-semibold text-wine-800"><MessageCircleHeart className="h-4 w-4 text-bloom-500"/>{m.nome}</p>
<p className="mt-1 text-sm leading-relaxed text-wine-600">{m.mensagem}</p>
</li>
))}
</ul>
):<p className="py-6 text-center text-sm text-wine-400">Os recados aparecerão aqui 💌</p>}
</Panel>
</section>
</AdminShell>
);
}
function Empty(){
return<div className="flex h-full items-center justify-center text-sm text-wine-400">Sem dados ainda</div>;
}
