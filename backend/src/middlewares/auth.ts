import type{Request,Response,NextFunction}from"express";
import jwt from"jsonwebtoken";
import{AppError}from"./error.js";
export interface AuthRequest extends Request{
admin?:{usuario:string};
}
export function authMiddleware(req:AuthRequest,_res:Response,next:NextFunction){
const header=req.headers.authorization;
if(!header?.startsWith("Bearer ")){
return next(new AppError("Não autorizado",401));
}
const token=header.slice(7);
try{
const secret=process.env.JWT_SECRET;
if(!secret)throw new AppError("JWT não configurado",500);
const payload=jwt.verify(token,secret)as{usuario:string};
req.admin={usuario:payload.usuario};
next();
}catch{
next(new AppError("Token inválido ou expirado",401));
}
}
