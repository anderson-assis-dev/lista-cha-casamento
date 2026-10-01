import type{ReactNode}from"react";
import{NavLink,useNavigate}from"react-router-dom";
import{ExternalLink,LogOut}from"lucide-react";
import{useAuth}from"../hooks";
import{Button}from"./ui";
const tabs=[
{to:"/admin/dashboard",label:"Visão geral"},
{to:"/admin/convidados",label:"Convidados"},
{to:"/admin/presentes",label:"Lista de presentes"},
{to:"/admin/configuracoes",label:"Pix & ajustes"},
];
export function AdminShell({children,actions}:{children:ReactNode;actions?:ReactNode}){
const{logout}=useAuth();
const navigate=useNavigate();
return(
<div className="min-h-screen bg-blush/60">
<header className="no-print sticky top-0 z-20 border-b border-bloom-100 bg-cream/95 backdrop-blur">
<div className="bg-bouquet h-1"/>
<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
<div className="flex items-center gap-3">
<span className="font-script text-3xl text-bloom-600">J&amp;E</span>
<div>
<h1 className="font-display text-xl font-semibold leading-tight text-wine-800">Painel do Chá</h1>
<p className="text-xs text-wine-500">Casa Nova · 08/11 · 13h</p>
</div>
</div>
<div className="flex items-center gap-2">
{actions}
<a href="/" target="_blank" rel="noreferrer"><Button variant="ghost" className="!px-3"><ExternalLink className="h-4 w-4"/><span className="hidden sm:inline">Ver convite</span></Button></a>
<Button variant="ghost" className="!px-3" onClick={()=>{logout();navigate("/admin");}}><LogOut className="h-4 w-4"/><span className="hidden sm:inline">Sair</span></Button>
</div>
</div>
<nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5">
{tabs.map((t)=>(
<NavLink
key={t.to}
to={t.to}
className={({isActive})=>`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${isActive?"border-bloom-500 text-bloom-700":"border-transparent text-wine-500 hover:text-wine-800"}`}
>
{t.label}
</NavLink>
))}
</nav>
</header>
<main className="mx-auto max-w-7xl space-y-6 px-5 py-8">{children}</main>
</div>
);
}
export function Panel({title,children,className="",right}:{title?:string;children:ReactNode;className?:string;right?:ReactNode}){
return(
<div className={`rounded-3xl border border-bloom-100/70 bg-white p-5 shadow-sm ${className}`}>
{(title||right)&&(
<div className="mb-4 flex items-center justify-between gap-3">
{title&&<p className="text-sm font-semibold text-wine-700">{title}</p>}
{right}
</div>
)}
{children}
</div>
);
}
