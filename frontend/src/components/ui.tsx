import{motion}from"framer-motion";
import type{InputHTMLAttributes,ReactNode,TextareaHTMLAttributes}from"react";
export function FadeIn({children,delay=0,className=""}:{children:ReactNode;delay?:number;className?:string}){
return(
<motion.div
className={className}
initial={{opacity:0,y:24}}
whileInView={{opacity:1,y:0}}
viewport={{once:true,margin:"-40px"}}
transition={{duration:0.7,delay,ease:[0.22,1,0.36,1]}}
>
{children}
</motion.div>
);
}
export function Button({
children,
onClick,
type="button",
variant="primary",
className="",
disabled,
}:{
children:ReactNode;
onClick?:()=>void;
type?:"button"|"submit";
variant?:"primary"|"secondary"|"ghost"|"outline"|"light";
className?:string;
disabled?:boolean;
}){
const base="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-bloom-400 focus-visible:ring-offset-2";
const variants={
primary:"bg-bouquet text-white shadow-lg shadow-bloom-500/25 hover:shadow-xl hover:shadow-bloom-500/35 hover:-translate-y-0.5",
secondary:"bg-marigold-100 text-wine-800 hover:bg-marigold-200",
ghost:"bg-transparent text-wine-600 hover:bg-bloom-50",
outline:"border border-bloom-200 bg-white/70 text-wine-800 hover:border-bloom-300 hover:bg-white",
light:"bg-white/90 text-bloom-700 shadow-lg hover:bg-white hover:-translate-y-0.5",
};
return(
<button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
{children}
</button>
);
}
export function Modal({open,onClose,children,title,wide}:{open:boolean;onClose:()=>void;children:ReactNode;title?:string;wide?:boolean}){
if(!open)return null;
return(
<div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
<button type="button" aria-label="Fechar" className="absolute inset-0 bg-wine-900/45 backdrop-blur-sm" onClick={onClose}/>
<motion.div
role="dialog"
aria-modal="true"
initial={{opacity:0,y:40,scale:0.96}}
animate={{opacity:1,y:0,scale:1}}
transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-cream p-6 shadow-2xl sm:rounded-[2rem] ${wide?"sm:max-w-2xl":"sm:max-w-lg"}`}
>
<div aria-hidden className="bg-bouquet absolute inset-x-0 top-0 h-1.5"/>
{title&&<h2 className="mb-4 pr-6 font-display text-3xl font-semibold text-wine-800">{title}</h2>}
{children}
</motion.div>
</div>
);
}
const fieldClass="w-full rounded-2xl border bg-white/80 px-4 py-3 text-wine-900 outline-none transition placeholder:text-wine-300 focus:border-bloom-300 focus:ring-2 focus:ring-bloom-100";
export function Input({
label,
error,
...props
}:{
label:string;
error?:string;
}&InputHTMLAttributes<HTMLInputElement>){
return(
<label className="block space-y-1.5">
<span className="text-sm font-medium text-wine-700">{label}</span>
<input
{...props}
className={`${fieldClass} ${error?"border-red-400":"border-bloom-100"} ${props.className??""}`}
/>
{error&&<span className="text-xs text-red-500">{error}</span>}
</label>
);
}
export function TextArea({
label,
error,
...props
}:{
label:string;
error?:string;
}&TextareaHTMLAttributes<HTMLTextAreaElement>){
return(
<label className="block space-y-1.5">
<span className="text-sm font-medium text-wine-700">{label}</span>
<textarea
{...props}
className={`min-h-24 ${fieldClass} ${error?"border-red-400":"border-bloom-100"} ${props.className??""}`}
/>
{error&&<span className="text-xs text-red-500">{error}</span>}
</label>
);
}
export function StatCard({label,value,hint,accent="bloom"}:{label:string;value:string|number;hint?:string;accent?:"bloom"|"tangerine"|"marigold"|"leaf"|"coral"}){
const bar={bloom:"bg-bloom-500",tangerine:"bg-tangerine-500",marigold:"bg-marigold-400",leaf:"bg-leaf-500",coral:"bg-coral-400"}[accent];
return(
<div className="relative overflow-hidden rounded-3xl border border-bloom-100/70 bg-white p-5 shadow-sm">
<div aria-hidden className={`absolute inset-y-0 left-0 w-1 ${bar}`}/>
<p className="text-xs font-medium uppercase tracking-wider text-wine-500">{label}</p>
<p className="mt-2 font-display text-4xl font-semibold text-wine-800">{value}</p>
{hint&&<p className="mt-1 text-xs text-wine-500">{hint}</p>}
</div>
);
}
export function Eyebrow({children,className=""}:{children:ReactNode;className?:string}){
return<p className={`text-xs font-semibold uppercase tracking-[0.3em] text-bloom-600 ${className}`}>{children}</p>;
}
