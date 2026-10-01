import{lazy,Suspense}from"react";
import{BrowserRouter,Navigate,Route,Routes}from"react-router-dom";
import{HomePage}from"./pages/HomePage";
import{useAuth}from"./hooks";
const AdminLoginPage=lazy(()=>import("./pages/AdminLoginPage").then((m)=>({default:m.AdminLoginPage})));
const AdminDashboardPage=lazy(()=>import("./pages/AdminDashboardPage").then((m)=>({default:m.AdminDashboardPage})));
const AdminConvidadosPage=lazy(()=>import("./pages/AdminConvidadosPage").then((m)=>({default:m.AdminConvidadosPage})));
const AdminPresentesPage=lazy(()=>import("./pages/AdminPresentesPage").then((m)=>({default:m.AdminPresentesPage})));
const AdminConfigPage=lazy(()=>import("./pages/AdminConfigPage").then((m)=>({default:m.AdminConfigPage})));
function AdminGate({children}:{children:React.ReactNode}){
const{isAuthenticated}=useAuth();
if(isAuthenticated)return<Navigate to="/admin/dashboard" replace/>;
return children;
}
export default function App(){
return(
<BrowserRouter>
<Suspense fallback={<div className="min-h-screen bg-blush"/>}>
<Routes>
<Route path="/" element={<HomePage/>}/>
<Route path="/admin" element={<AdminGate><AdminLoginPage/></AdminGate>}/>
<Route path="/admin/dashboard" element={<AdminDashboardPage/>}/>
<Route path="/admin/convidados" element={<AdminConvidadosPage/>}/>
<Route path="/admin/presentes" element={<AdminPresentesPage/>}/>
<Route path="/admin/configuracoes" element={<AdminConfigPage/>}/>
<Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>
</Suspense>
</BrowserRouter>
);
}
