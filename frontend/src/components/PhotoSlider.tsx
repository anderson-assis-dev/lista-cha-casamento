import{useCallback,useEffect,useState}from"react";
import{AnimatePresence,motion}from"framer-motion";
import{ChevronLeft,ChevronRight}from"lucide-react";
export function PhotoSlider({photos,interval=4500}:{photos:string[];interval?:number}){
const[index,setIndex]=useState(0);
const[paused,setPaused]=useState(false);
const go=useCallback((dir:number)=>setIndex((i)=>(i+dir+photos.length)%photos.length),[photos.length]);
useEffect(()=>{
if(paused)return;
const id=setInterval(()=>go(1),interval);
return()=>clearInterval(id);
},[go,interval,paused]);
const prev=(index-1+photos.length)%photos.length;
const next=(index+1)%photos.length;
return(
<div
className="relative mx-auto w-full max-w-4xl"
onMouseEnter={()=>setPaused(true)}
onMouseLeave={()=>setPaused(false)}
>
<div className="relative flex items-center justify-center gap-4">
<img src={photos[prev]} alt="" aria-hidden loading="lazy" className="hidden aspect-[2/3] w-52 rounded-[1.75rem] object-cover opacity-50 blur-[1px] md:block"/>
<div className="relative aspect-[2/3] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl shadow-bloom-900/20 ring-4 ring-white">
<AnimatePresence initial={false} mode="popLayout">
<motion.img
key={index}
src={photos[index]}
alt={`Foto ${index+1} de João e Elen`}
className="absolute inset-0 h-full w-full cursor-grab object-cover active:cursor-grabbing"
initial={{opacity:0,scale:1.04}}
animate={{opacity:1,scale:1}}
exit={{opacity:0}}
transition={{duration:0.8,ease:[0.22,1,0.36,1]}}
drag="x"
dragConstraints={{left:0,right:0}}
dragElastic={0.2}
onDragEnd={(_,info)=>{
if(info.offset.x<-60)go(1);
else if(info.offset.x>60)go(-1);
}}
/>
</AnimatePresence>
</div>
<img src={photos[next]} alt="" aria-hidden loading="lazy" className="hidden aspect-[2/3] w-52 rounded-[1.75rem] object-cover opacity-50 blur-[1px] md:block"/>
<button type="button" onClick={()=>go(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-bloom-700 shadow-lg transition hover:scale-105 md:left-[12%]">
<ChevronLeft className="h-5 w-5"/>
</button>
<button type="button" onClick={()=>go(1)} aria-label="Próxima foto" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-bloom-700 shadow-lg transition hover:scale-105 md:right-[12%]">
<ChevronRight className="h-5 w-5"/>
</button>
</div>
<div className="mt-6 flex justify-center gap-2">
{photos.map((_,i)=>(
<button
key={i}
type="button"
onClick={()=>setIndex(i)}
aria-label={`Ir para foto ${i+1}`}
className={`h-2 rounded-full transition-all ${i===index?"w-8 bg-bloom-500":"w-2 bg-bloom-200 hover:bg-bloom-300"}`}
/>
))}
</div>
</div>
);
}
