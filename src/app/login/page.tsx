import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms";
import { hasValidSession, passwordIsConfigured } from "@/lib/auth";

export const metadata = { title: "Acceso" };

export default async function LoginPage() {
  if (await hasValidSession()) redirect("/");
  const configured = passwordIsConfigured();
  return <main className="grid min-h-screen place-items-center px-4 py-10"><section className="panel grid w-full max-w-md gap-7 p-6 sm:p-8">
    <div className="grid size-14 place-items-center rounded-2xl border border-[#3c5142] bg-[#18241b] text-[#6de28f]"><LockKeyhole size={25}/></div>
    <div><p className="eyebrow mb-3">Acceso privado</p><h1 className="pixel-shadow text-3xl font-black tracking-tight">MINECRAFT EXTREMO</h1><p className="muted mt-3 leading-relaxed">Panel compartido para los tres supervivientes. Una contraseña, cero cuentas.</p></div>
    {!configured&&<div className="rounded-xl border border-[#5f4f26] bg-[#2d2614] p-3 text-sm text-[#f7d77f]">Falta configurar <code>APP_PASSWORD</code> en el entorno.</div>}
    <LoginForm/>
    <p className="flex items-center gap-2 text-xs text-[#728078]"><ShieldCheck size={15}/> Cookie segura y operaciones validadas en el servidor.</p>
  </section></main>;
}
