import{z}from"zod";
const telefone=z.string().min(10,"Telefone inválido").max(20).regex(/^[0-9+\s()-]+$/,"Telefone inválido");
export const presencaEnum=z.enum(["SIM","NAO"]);
export type Presenca=z.infer<typeof presencaEnum>;
export const createConvidadoSchema=z.object({
nome:z.string().trim().min(2,"Nome deve ter pelo menos 2 caracteres").max(120),
telefone,
presenca:presencaEnum,
adultos:z.coerce.number().int().min(0).max(30),
criancas:z.coerce.number().int().min(0).max(30),
mensagem:z.string().max(500).optional().nullable(),
});
export type CreateConvidadoDTO=z.infer<typeof createConvidadoSchema>;
export const updateConvidadoSchema=z.object({
nome:z.string().trim().min(2).max(120).optional(),
telefone:telefone.optional(),
presenca:presencaEnum.optional(),
adultos:z.coerce.number().int().min(0).max(30).optional(),
criancas:z.coerce.number().int().min(0).max(30).optional(),
mensagem:z.string().max(500).optional().nullable(),
presenteOutro:z.string().max(200).optional().nullable(),
pixValor:z.coerce.number().min(0).max(1000000).optional().nullable(),
});
export type UpdateConvidadoDTO=z.infer<typeof updateConvidadoSchema>;
export const reservarSchema=z.object({
presenteIds:z.array(z.string().min(1)).min(1,"Escolha ao menos um item").max(5,"Escolha no máximo 5 itens"),
});
export type ReservarDTO=z.infer<typeof reservarSchema>;
export const outroSchema=z.object({
descricao:z.string().trim().min(2,"Conte pra gente o que pretende levar").max(200),
});
export type OutroDTO=z.infer<typeof outroSchema>;
export const pixSchema=z.object({
valor:z.coerce.number().min(1,"Informe um valor").max(100000),
});
export type PixDTO=z.infer<typeof pixSchema>;
export const presenteSchema=z.object({
nome:z.string().trim().min(2).max(120),
categoria:z.string().trim().min(2).max(60),
ativo:z.boolean().optional(),
});
export type PresenteDTO=z.infer<typeof presenteSchema>;
export const updatePresenteSchema=presenteSchema.partial().extend({
liberar:z.boolean().optional(),
});
export type UpdatePresenteDTO=z.infer<typeof updatePresenteSchema>;
export const loginSchema=z.object({
usuario:z.string().min(1),
senha:z.string().min(1),
});
export type LoginDTO=z.infer<typeof loginSchema>;
export const configuracaoSchema=z.object({
pixChave:z.string().trim().max(77),
pixNome:z.string().trim().min(1).max(25),
pixCidade:z.string().trim().min(1).max(15),
pixCopiaECola:z.string().trim().max(512).refine((v)=>!v||v.startsWith("000201"),"Código Pix Copia e Cola inválido"),
pixLink:z.string().trim().max(300).refine((v)=>!v||/^https:\/\//.test(v),"Link deve começar com https://"),
});
export type ConfiguracaoDTO=z.infer<typeof configuracaoSchema>;
