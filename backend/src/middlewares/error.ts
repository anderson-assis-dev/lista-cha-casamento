import{ZodError}from"zod";
import type{Request,Response,NextFunction}from"express";
import{ZodSchema}from"zod";
export class AppError extends Error{
statusCode:number;
constructor(message:string,statusCode=400){
super(message);
this.statusCode=statusCode;
}
}
export function errorHandler(err:unknown,_req:Request,res:Response,_next:NextFunction){
if(err instanceof AppError){
return res.status(err.statusCode).json({error:err.message});
}
if(err instanceof ZodError){
return res.status(400).json({error:"Dados inválidos",details:err.flatten()});
}
console.error(err);
return res.status(500).json({error:"Erro interno do servidor"});
}
export function validateBody<T>(schema:ZodSchema<T>){
return(req:Request,_res:Response,next:NextFunction)=>{
try{
req.body=schema.parse(req.body);
next();
}catch(error){
next(error);
}
};
}
export function normalizePhone(phone:string):string{
return phone.replace(/\D/g,"");
}
