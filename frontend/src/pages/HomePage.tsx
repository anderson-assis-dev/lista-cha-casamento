import{useEffect,useMemo,useState}from"react";
import{CalendarPlus,CheckCircle2,Clock,Copy,Crown,Gift,Heart,MapPin,QrCode,Share2,Sparkles}from"lucide-react";
import{QRCodeSVG}from"qrcode.react";
import{motion}from"framer-motion";
import{CATEGORIA_PADRINHOS,COVER,EVENT,PHOTOS,type PresentePublico}from"../lib/constants";
import{getPresentes}from"../lib/api";
import{loadGuest,useCountdown,type GuestRef}from"../hooks";
import{Divider,FloralCluster,PetalsBg}from"../components/decor";
import{Button,Eyebrow,FadeIn}from"../components/ui";
import{PhotoSlider}from"../components/PhotoSlider";
import{PresencaFlow,type FlowStep}from"../components/PresencaFlow";
export function HomePage(){
const countdown=useCountdown();
const[flow,setFlow]=useState<{open:boolean;step:FlowStep}>({open:false,step:"form"});
const[guest,setGuest]=useState<GuestRef|null>(loadGuest);
const[copied,setCopied]=useState(false);
const[presentes,setPresentes]=useState<PresentePublico[]>([]);
const inviteUrl=useMemo(()=>typeof window!=="undefined"?window.location.origin:"",[]);
useEffect(()=>{
getPresentes().then(setPresentes).catch(()=>{});
},[flow.open]);
const listaConvidados=presentes.filter((p)=>p.categoria!==CATEGORIA_PADRINHOS);
const listaPadrinhos=presentes.filter((p)=>p.categoria===CATEGORIA_PADRINHOS);
const disponiveis=listaConvidados.filter((p)=>!p.reservado).length;
const padrinhosDisponiveis=listaPadrinhos.filter((p)=>!p.reservado).length;
function openPresenca(){
setFlow({open:true,step:"form"});
}
function openPresente(step:FlowStep="escolha"){
setFlow({open:true,step:guest?step:"form"});
}
function addToCalendar(){
const d=EVENT.dateISO.replace(/-/g,"");
const start=`${d}T${EVENT.time.replace(":","")}00`;
const end=`${d}T${EVENT.timeEnd.replace(":","")}00`;
const details=encodeURIComponent(`${EVENT.message}\n\n${EVENT.venue}\n${EVENT.address}\n${inviteUrl}`);
const location=encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`);
const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENT.title)}&dates=${start}/${end}&ctz=America/Bahia&details=${details}&location=${location}`;
window.open(url,"_blank");
}
async function copyLink(){
await navigator.clipboard.writeText(inviteUrl);
setCopied(true);
setTimeout(()=>setCopied(false),2000);
}
async function shareInvite(){
if(navigator.share){
try{
await navigator.share({title:EVENT.title,text:"Você é nosso convidado especial! 💐 Confirme sua presença no Chá de Casa Nova de João & Ellen:",url:inviteUrl});
return;
}catch{/* cancelado */}
}
await copyLink();
}
return(
<div className="relative min-h-screen overflow-x-hidden">
<header className="no-print absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-10">
<img src="/logo.webp" alt="Monograma de João e Ellen" className="h-16 w-auto sm:h-20"/>
<Button variant="outline" className="!px-4 !py-2" onClick={()=>(guest?openPresente():openPresenca())}>
{guest?<><Gift className="h-4 w-4"/>Presentear</>:<><CheckCircle2 className="h-4 w-4"/>Confirmar</>}
</Button>
</header>
<section className="relative isolate overflow-hidden bg-blush">
<PetalsBg/>
<div className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-5 pb-16 pt-24 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
<div className="order-2 text-center lg:order-1 lg:text-left">
<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
<Eyebrow>Chá de Casa Nova</Eyebrow>
</motion.div>
<motion.h1
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.8,delay:0.1}}
className="-mx-6 mt-3 px-6 py-2 font-script text-[4.25rem] leading-[1.05] text-bouquet sm:text-8xl lg:text-[7.5rem]"
>
João <span className="text-5xl sm:text-7xl">&amp;</span> Ellen
</motion.h1>
<motion.p
initial={{opacity:0,y:16}}
animate={{opacity:1,y:0}}
transition={{duration:0.7,delay:0.25}}
className="mx-auto mt-5 max-w-md font-display text-2xl italic leading-snug text-wine-700 lg:mx-0"
>
Um novo lar, uma nova história — e queremos você conosco.
</motion.p>
<motion.div
initial={{opacity:0,y:16}}
animate={{opacity:1,y:0}}
transition={{duration:0.7,delay:0.35}}
className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-white/80 px-5 py-2.5 text-sm font-medium text-wine-700 shadow-sm"
>
<span>{EVENT.dateLong}</span>
<span className="h-1 w-1 rounded-full bg-bloom-400"/>
<span>{EVENT.timeLabel}</span>
<span className="h-1 w-1 rounded-full bg-bloom-400"/>
<span>Lauro de Freitas</span>
</motion.div>
<motion.div
initial={{opacity:0,y:16}}
animate={{opacity:1,y:0}}
transition={{duration:0.7,delay:0.45}}
className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
>
{guest?(
<Button onClick={()=>openPresente()}><Gift className="h-4 w-4"/>Escolher meu presente</Button>
):(
<Button onClick={openPresenca}><CheckCircle2 className="h-4 w-4"/>Confirmar presença</Button>
)}
<a href="#presentes"><Button variant="outline"><Sparkles className="h-4 w-4"/>Lista de presentes</Button></a>
</motion.div>
{guest&&<p className="mt-4 text-sm text-wine-500">Oi, {guest.nome}! Sua resposta já está com a gente 💛</p>}
</div>
<motion.div
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
transition={{duration:1,delay:0.15}}
className="relative order-1 mx-auto w-full max-w-[20rem] sm:max-w-sm lg:order-2"
>
<div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[2.5rem] shadow-2xl shadow-bloom-900/25 ring-[6px] ring-white">
<img src={COVER} alt="João e Ellen sorrindo abraçados" className="h-full w-full object-cover object-[50%_30%]" fetchPriority="high"/>
</div>
<FloralCluster className="animate-sway absolute -bottom-10 -left-12 w-44 sm:w-56"/>
<FloralCluster className="animate-sway absolute -right-10 -top-4 w-32 rotate-[160deg] sm:w-40"/>
</motion.div>
</div>
</section>
<section className="relative bg-cream px-5 py-20 sm:px-10">
<FadeIn className="mx-auto max-w-2xl text-center">
<Divider/>
<p className="mt-8 font-display text-2xl leading-relaxed text-wine-800 sm:text-3xl text-balance">
“{EVENT.message}”
</p>
<p className="mt-6 font-script text-4xl text-bloom-600">João &amp; Ellen</p>
<p className="mt-6 text-sm italic text-wine-500">“Se o Senhor não edificar a casa, em vão trabalham os que a edificam.” — Salmos 127:1</p>
</FadeIn>
</section>
<section className="relative overflow-hidden bg-bouquet px-5 py-14 text-white sm:px-10">
<FadeIn className="mx-auto max-w-4xl text-center">
<p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{countdown.chegou?"Chegou o grande dia!":"Contagem regressiva"}</p>
<div className="mt-6 grid grid-cols-4 gap-3 sm:gap-6">
{([["dias",countdown.dias],["horas",countdown.horas],["min",countdown.minutos],["seg",countdown.segundos]] as const).map(([label,v])=>(
<div key={label} className="rounded-3xl bg-white/15 px-2 py-4 backdrop-blur-sm ring-1 ring-white/25">
<p className="font-display text-4xl font-semibold tabular-nums sm:text-6xl">{String(v).padStart(2,"0")}</p>
<p className="mt-1 text-xs uppercase tracking-widest text-white/80">{label}</p>
</div>
))}
</div>
</FadeIn>
</section>
<section className="relative bg-cream px-5 py-20 sm:px-10">
<FadeIn className="text-center">
<Eyebrow>Nossos momentos</Eyebrow>
<h2 className="mt-3 font-display text-4xl font-semibold text-wine-800 sm:text-5xl">Um pouquinho da gente</h2>
<p className="mx-auto mt-3 max-w-lg text-wine-600">Cada passo até aqui foi dado de mãos dadas. Agora, o próximo capítulo tem endereço novo.</p>
</FadeIn>
<FadeIn delay={0.1} className="mt-10">
<PhotoSlider photos={PHOTOS}/>
</FadeIn>
</section>
<section className="relative bg-blush px-5 py-20 sm:px-10">
<PetalsBg/>
<div className="relative z-10 mx-auto max-w-5xl">
<FadeIn className="text-center">
<Eyebrow>Quando &amp; onde</Eyebrow>
<h2 className="mt-3 font-display text-4xl font-semibold text-wine-800 sm:text-5xl">Anota aí na agenda</h2>
</FadeIn>
<FadeIn delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-3">
<InfoCard icon={<CalendarPlus className="h-5 w-5"/>} tone="bg-bloom-500" label="Data" value={EVENT.dateLabel} sub={EVENT.dateLong}/>
<InfoCard icon={<Clock className="h-5 w-5"/>} tone="bg-tangerine-500" label="Horário" value={EVENT.timeLabel} sub="Chegue um pouquinho antes 😉"/>
<InfoCard icon={<MapPin className="h-5 w-5"/>} tone="bg-leaf-500" label="Local" value="Colégio Adventista" sub="de Lauro de Freitas — BA"/>
</FadeIn>
<FadeIn delay={0.12} className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-wine-600">
<p className="font-semibold text-wine-800">{EVENT.venue}</p>
<p>{EVENT.address}</p>
</FadeIn>
<FadeIn delay={0.15} className="mt-8 flex flex-wrap justify-center gap-3">
<a href={EVENT.mapsUrl} target="_blank" rel="noreferrer"><Button variant="outline"><MapPin className="h-4 w-4"/>Como chegar</Button></a>
<Button variant="secondary" onClick={addToCalendar}><CalendarPlus className="h-4 w-4"/>Adicionar ao calendário</Button>
</FadeIn>
</div>
</section>
<section id="presentes" className="relative scroll-mt-10 bg-cream px-5 py-20 sm:px-10">
<div className="mx-auto max-w-5xl">
<FadeIn className="text-center">
<Eyebrow>Presentes</Eyebrow>
<h2 className="mt-3 font-display text-4xl font-semibold text-wine-800 sm:text-5xl">Ajude a montar nosso cantinho</h2>
<p className="mx-auto mt-4 max-w-2xl leading-relaxed text-wine-600">
Sua presença é, de verdade, o nosso maior presente. Mas se o seu coração quiser deixar uma lembrança no nosso lar,
preparamos algumas opções com todo carinho — escolha a que for mais fácil pra você.
</p>
</FadeIn>
<FadeIn delay={0.1} className="mt-10 grid gap-4 md:grid-cols-3">
<GiftCard
tone="from-bloom-500 to-bloom-600"
icon={<Gift className="h-6 w-6"/>}
title="Lista de presentes"
text={listaConvidados.length?`${disponiveis} de ${listaConvidados.length} itens ainda esperando alguém especial. Cada item só pode ser escolhido uma vez.`:"Sugestões pra casa nova. Cada item só pode ser escolhido uma vez."}
cta="Ver a lista"
onClick={()=>openPresente("lista")}
/>
<GiftCard
tone="from-tangerine-500 to-tangerine-400"
icon={<QrCode className="h-6 w-6"/>}
title="Pix"
text="Prefere praticidade? Seu Pix vira aquele móvel, eletro ou detalhe que ainda falta pra casa ficar do nosso jeitinho."
cta="Presentear com Pix"
onClick={()=>openPresente("pix-valor")}
/>
<GiftCard
tone="from-marigold-400 to-marigold-500"
icon={<Heart className="h-6 w-6"/>}
title="Do seu coração"
text="Pensou em algo especial que não está na lista? Conta pra gente o que é — assim evitamos repetições."
cta="Contar meu presente"
onClick={()=>openPresente("outro")}
/>
</FadeIn>
{listaConvidados.length>0&&(
<FadeIn delay={0.15} className="mx-auto mt-10 max-w-md">
<div className="flex items-center justify-between text-sm text-wine-600">
<span>Lista já escolhida</span>
<span className="font-semibold text-bloom-600">{listaConvidados.length-disponiveis}/{listaConvidados.length}</span>
</div>
<div className="mt-2 h-2.5 overflow-hidden rounded-full bg-bloom-100">
<div className="bg-bouquet h-full rounded-full transition-all duration-700" style={{width:`${((listaConvidados.length-disponiveis)/listaConvidados.length)*100}%`}}/>
</div>
</FadeIn>
)}
<FadeIn delay={0.2} className="mx-auto mt-14 max-w-3xl">
<div className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-leaf-100 sm:p-10">
<FloralCluster className="pointer-events-none absolute -right-10 -top-8 w-32 rotate-[160deg] opacity-90"/>
<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-400 text-white shadow-md"><Crown className="h-6 w-6"/></span>
<Eyebrow className="mt-5">Padrinhos &amp; madrinhas</Eyebrow>
<h3 className="mt-2 font-display text-3xl font-semibold text-wine-800 sm:text-4xl">Lista dos padrinhos</h3>
<p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-wine-600">
Vocês, que caminham tão pertinho da gente, ganharam uma lista só de vocês — com os itens maiores que vão fazer a nossa casa funcionar.
{listaPadrinhos.length>0&&` ${padrinhosDisponiveis} de ${listaPadrinhos.length} itens ainda disponíveis.`}
</p>
<div className="mt-6 flex justify-center">
<Button onClick={()=>openPresente("padrinhos")}><Crown className="h-4 w-4"/>Ver lista dos padrinhos</Button>
</div>
</div>
</FadeIn>
</div>
</section>
<section className="relative bg-blush px-5 py-20 sm:px-10">
<FadeIn className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[2rem] bg-white/80 p-8 text-center shadow-sm ring-1 ring-bloom-100">
<p className="font-display text-3xl font-semibold text-wine-800">Compartilhe o convite</p>
<p className="-mt-2 text-sm text-wine-500">Conhece alguém que não pode ficar de fora? Manda pra ele!</p>
<div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-bloom-50">
<QRCodeSVG value={inviteUrl||"https://casa-nova.local"} size={150} bgColor="transparent" fgColor="#9c0d49"/>
</div>
<div className="flex flex-wrap justify-center gap-3">
<Button variant="outline" onClick={shareInvite}><Share2 className="h-4 w-4"/>Compartilhar</Button>
<Button variant="secondary" onClick={copyLink}><Copy className="h-4 w-4"/>{copied?"Link copiado!":"Copiar link"}</Button>
</div>
</FadeIn>
</section>
<section className="relative overflow-hidden bg-cream px-5 py-20 text-center sm:px-10">
<FadeIn>
<FloralCluster className="mx-auto w-40"/>
<h2 className="mt-4 font-display text-4xl font-semibold text-wine-800 sm:text-5xl">Contamos com você!</h2>
<p className="mx-auto mt-3 max-w-md text-wine-600">Confirme sua presença pra gente preparar tudo com muito amor e cuidado.</p>
<div className="mt-8 flex justify-center">
{guest?(
<Button onClick={()=>openPresente()}><Gift className="h-4 w-4"/>Escolher meu presente</Button>
):(
<Button onClick={openPresenca}><CheckCircle2 className="h-4 w-4"/>Confirmar presença</Button>
)}
</div>
</FadeIn>
</section>
<footer className="border-t border-bloom-100 bg-cream px-5 py-10 text-center">
<p className="font-script text-4xl text-bloom-600">João &amp; Ellen</p>
<p className="mt-2 text-sm text-wine-500">Com amor, para quem faz parte da nossa história · 08.11.2026</p>
</footer>
<PresencaFlow
open={flow.open}
startAt={flow.step}
guest={guest}
onGuest={setGuest}
onClose={()=>setFlow((f)=>({...f,open:false}))}
/>
</div>
);
}
function InfoCard({icon,tone,label,value,sub}:{icon:React.ReactNode;tone:string;label:string;value:string;sub:string}){
return(
<div className="rounded-[2rem] bg-white/85 p-6 text-center shadow-sm ring-1 ring-bloom-100">
<span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-white ${tone}`}>{icon}</span>
<p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-wine-400">{label}</p>
<p className="mt-1 font-display text-3xl font-semibold text-wine-800 sm:text-4xl">{value}</p>
<p className="mt-1 text-sm text-wine-500">{sub}</p>
</div>
);
}
function GiftCard({tone,icon,title,text,cta,onClick}:{tone:string;icon:React.ReactNode;title:string;text:string;cta:string;onClick:()=>void}){
return(
<div className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-bloom-100 transition hover:-translate-y-1 hover:shadow-lg">
<span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${tone}`}>{icon}</span>
<h3 className="mt-5 font-display text-2xl font-semibold text-wine-800">{title}</h3>
<p className="mt-2 flex-1 text-sm leading-relaxed text-wine-600">{text}</p>
<button type="button" onClick={onClick} className="mt-5 self-start text-sm font-semibold text-bloom-600 underline-offset-4 hover:underline">{cta} →</button>
</div>
);
}
