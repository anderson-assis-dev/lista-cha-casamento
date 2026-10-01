const PALETTE={
bloom:"#e01e6c",
bloomDeep:"#c2105a",
coral:"#f8a7a3",
tangerine:"#f26b1d",
marigold:"#fbbf24",
leaf:"#3a6d31",
leafLight:"#69a05b",
};
function Rose({x,y,r,color,center}:{x:number;y:number;r:number;color:string;center:string}){
return(
<g transform={`translate(${x} ${y})`}>
{[0,72,144,216,288].map((a)=>(
<ellipse key={a} cx={0} cy={-r*0.55} rx={r*0.55} ry={r*0.62} fill={color} transform={`rotate(${a})`} opacity={0.92}/>
))}
<circle r={r*0.42} fill={center}/>
<path d={`M${-r*0.2} 0a${r*0.2} ${r*0.2} 0 1 1 ${r*0.4} 0`} stroke={color} strokeWidth={r*0.08} fill="none" opacity={0.7}/>
</g>
);
}
function Leaf({x,y,rot,size,color}:{x:number;y:number;rot:number;size:number;color:string}){
return(
<path
d={`M0 0C${size*0.35} ${-size*0.25} ${size*0.75} ${-size*0.2} ${size} 0C${size*0.75} ${size*0.2} ${size*0.35} ${size*0.25} 0 0Z`}
fill={color}
transform={`translate(${x} ${y}) rotate(${rot})`}
/>
);
}
export function FloralCluster({className=""}:{className?:string}){
return(
<svg className={className} viewBox="0 0 240 200" fill="none" aria-hidden>
<Leaf x={60} y={120} rot={-150} size={70} color={PALETTE.leaf}/>
<Leaf x={150} y={110} rot={-30} size={80} color={PALETTE.leafLight}/>
<Leaf x={110} y={150} rot={100} size={55} color={PALETTE.leaf}/>
<Leaf x={170} y={140} rot={20} size={60} color={PALETTE.leaf}/>
<Rose x={80} y={95} r={34} color={PALETTE.bloom} center={PALETTE.bloomDeep}/>
<Rose x={140} y={80} r={30} color={PALETTE.coral} center="#f08486"/>
<Rose x={120} y={130} r={24} color={PALETTE.tangerine} center="#cf540c"/>
<Rose x={185} y={115} r={20} color={PALETTE.marigold} center="#eea20b"/>
<Rose x={45} y={140} r={18} color={PALETTE.tangerine} center="#cf540c"/>
<circle cx={100} cy={55} r={6} fill={PALETTE.marigold}/>
<circle cx={170} cy={60} r={5} fill={PALETTE.bloom}/>
</svg>
);
}
export function PetalsBg(){
return(
<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
<div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-bloom-100/70 blur-3xl"/>
<div className="absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-tangerine-100/80 blur-3xl"/>
<div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-marigold-100/80 blur-3xl"/>
</div>
);
}
export function Divider({className=""}:{className?:string}){
return(
<div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
<span className="h-px w-16 bg-gradient-to-r from-transparent to-bloom-300"/>
<svg viewBox="0 0 24 24" className="h-5 w-5"><Rose x={12} y={12} r={8} color={PALETTE.bloom} center={PALETTE.marigold}/></svg>
<span className="h-px w-16 bg-gradient-to-l from-transparent to-bloom-300"/>
</div>
);
}
