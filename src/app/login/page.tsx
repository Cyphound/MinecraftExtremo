import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { BiomeLegend, RealmMark } from "@/components/brand";
import { LoginForm } from "@/components/forms";
import { PageReveal } from "@/components/motion";
import { hasValidSession, passwordIsConfigured } from "@/lib/auth";

export const metadata = { title: "Acceso" };

export default async function LoginPage() {
  if (await hasValidSession()) redirect("/");
  const configured = passwordIsConfigured();
  return <main className="voxel-grid grid min-h-screen place-items-center px-4 py-10">
    <PageReveal>
      <section className="glass-shell relative grid w-[min(92vw,460px)] gap-7 overflow-hidden rounded-[1.75rem] p-6 sm:p-9">
        <div className="world-strata"><span/><span/><span/></div>
        <div className="relative flex items-center justify-between"><RealmMark/><BiomeLegend/></div>
        <div className="relative">
          <p className="eyebrow mb-3">Acceso privado</p>
          <h1 className="mc-title pixel-shadow text-4xl leading-[.9]">MINECRAFT <strong>EXTREMO</strong></h1>
          <p className="muted mt-4 leading-relaxed">El Realm privado de los tres supervivientes. Una clave compartida, un solo mundo.</p>
        </div>
        {!configured&&<div className="relative rounded-xl border border-[#5f4f26] bg-[#2d2614] p-3 text-sm text-[#f7d77f]">Falta configurar <code>APP_PASSWORD</code> en el entorno.</div>}
        <div className="relative"><LoginForm/></div>
        <p className="relative flex items-center gap-2 border-t border-white/8 pt-5 text-xs text-[#728078]"><ShieldCheck size={15}/> Acceso cifrado y operaciones protegidas en el servidor.</p>
        <span className="absolute right-7 top-7 grid size-10 place-items-center border border-white/10 bg-white/5 text-[#91eca7]"><LockKeyhole size={18}/></span>
      </section>
    </PageReveal>
  </main>;
}
