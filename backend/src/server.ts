import"dotenv/config";
import path from"node:path";
import fs from"node:fs";
import{fileURLToPath}from"node:url";
import express,{type RequestHandler}from"express";
import cors from"cors";
import morgan from"morgan";
import{publicRouter,adminRouter}from"./routes/index.js";
import{errorHandler}from"./middlewares/error.js";
import{configuracaoRepository}from"./repositories/configuracao.repository.js";
import{presenteRepository}from"./repositories/presente.repository.js";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(__dirname,"../public");
const app=express();
const port=Number(process.env.PORT??3001);
const origins=(process.env.CORS_ORIGIN??"http://localhost:5173")
.split(",")
.map((o)=>o.trim())
.filter(Boolean);
app.disable("x-powered-by");
app.use((_req,_res,next)=>{
_res.setHeader("X-Content-Type-Options","nosniff");
_res.setHeader("X-Frame-Options","DENY");
_res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
next();
});
app.use(cors({
origin:(origin,cb)=>{
if(!origin||origins.includes("*")||origins.includes(origin))return cb(null,true);
return cb(null,origins[0]??true);
},
credentials:true,
}) as RequestHandler);
app.use(express.json());
if(process.env.NODE_ENV!=="production")app.use(morgan("dev"));
app.get("/api/health",(_req,res)=>res.json({ok:true}));
app.use("/api",publicRouter);
app.use("/api/admin",adminRouter);
if(fs.existsSync(publicDir)){
app.use(express.static(publicDir,{index:false}));
app.get(/^(?!\/api).*/,(req,res,next)=>{
if(req.method!=="GET"&&req.method!=="HEAD")return next();
res.sendFile(path.join(publicDir,"index.html"),(err)=>{
if(err)next(err);
});
});
}else{
app.get("/",(_req,res)=>{
res.type("html").send(`<!doctype html><html lang="pt-BR"><body style="font-family:system-ui;padding:2rem"><h1>Chá de Casa Nova — João &amp; Elen — API</h1><p>Frontend ainda não foi gerado neste deploy.</p><p><a href="/api/health">/api/health</a></p></body></html>`);
});
}
app.use(errorHandler);
async function bootstrap(){
await configuracaoRepository.get();
await presenteRepository.ensureDefaults();
if(process.env.VERCEL)return;
app.listen(port,()=>{
console.log(`API rodando em http://localhost:${port}`);
});
}
bootstrap().catch((err)=>{
console.error(err);
if(!process.env.VERCEL)process.exit(1);
});
export default app;
