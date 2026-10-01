import type{Request,Response,NextFunction,RequestHandler}from"express";
import{convidadoService,presenteService,configuracaoService,authService}from"../services/index.js";
function handle(fn:(req:Request)=>Promise<unknown>,status=200):RequestHandler{
return async(req:Request,res:Response,next:NextFunction)=>{
try{
res.status(status).json(await fn(req));
}catch(error){next(error);}
};
}
const id=(req:Request)=>String(req.params.id);
export const convidadoController={
create:handle((req)=>convidadoService.create(req.body),201),
reservar:handle((req)=>convidadoService.reservar(id(req),req.body)),
outro:handle((req)=>convidadoService.outro(id(req),req.body)),
pix:handle((req)=>convidadoService.pix(id(req),req.body)),
presentesPublicos:handle(()=>convidadoService.presentesPublicos()),
list:handle(()=>convidadoService.list()),
update:handle((req)=>convidadoService.update(id(req),req.body)),
remove:handle((req)=>convidadoService.remove(id(req))),
dashboard:handle(()=>convidadoService.dashboard()),
async exportCsv(_req:Request,res:Response,next:NextFunction){
try{
const csv=await convidadoService.exportCsv();
res.setHeader("Content-Type","text/csv; charset=utf-8");
res.setHeader("Content-Disposition",'attachment; filename="convidados.csv"');
res.send("﻿"+csv);
}catch(error){next(error);}
},
async exportExcel(_req:Request,res:Response,next:NextFunction){
try{
const buffer=await convidadoService.exportExcel();
res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
res.setHeader("Content-Disposition",'attachment; filename="cha-casa-nova.xlsx"');
res.send(buffer);
}catch(error){next(error);}
},
};
export const presenteController={
list:handle(()=>presenteService.list()),
create:handle((req)=>presenteService.create(req.body),201),
update:handle((req)=>presenteService.update(id(req),req.body)),
remove:handle((req)=>presenteService.remove(id(req))),
};
export const configuracaoController={
get:handle(()=>configuracaoService.get()),
update:handle((req)=>configuracaoService.update(req.body)),
};
export const authController={
login:handle((req)=>authService.login(req.body)),
};
