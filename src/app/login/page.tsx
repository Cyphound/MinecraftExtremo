import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck, Skull, Swords, UsersRound } from "lucide-react";
import { BiomeLegend, RealmMark } from "@/components/brand";
import { LoginForm } from "@/components/forms";
import { PageReveal } from "@/components/motion";
import { hasValidSession, passwordIsConfigured } from "@/lib/auth";

export const metadata = { title: "Acceso" };

export default async function LoginPage() {
  if (await hasValidSession()) redirect("/");
  const configured = passwordIsConfigured();
  return <main className="login-page">
    <PageReveal>
      <div className="login-layout">
        <section className="login-story obsidian-panel">
          <div className="login-brand"><RealmMark/><span>HARDCORE REALM</span></div>
          <div>
            <p className="eyebrow mb-4">Temporada privada</p>
            <h1 className="mc-title login-title">MINECRAFT <strong>EXTREMO</strong></h1>
            <p className="login-lead">Tres jugadores. Una sola vida compartida. Cada mundo deja una historia.</p>
          </div>
          <BiomeLegend/>
          <div className="login-rules">
            <span><UsersRound size={18}/><small>Equipo</small><strong>3 jugadores</strong></span>
            <span><Skull size={18}/><small>Regla</small><strong>Una muerte</strong></span>
            <span><Swords size={18}/><small>Objetivo</small><strong>El dragón</strong></span>
          </div>
        </section>

        <section className="login-card glass-shell">
          <span className="login-lock"><LockKeyhole size={22}/></span>
          <div><p className="eyebrow mb-2">Acceso privado</p><h2 className="display-font text-2xl font-bold">Entrar al Realm</h2><p className="muted mt-2 text-sm leading-relaxed">Usa la contraseña compartida del equipo para abrir el registro.</p></div>
          {!configured&&<div className="rounded-xl border border-[#8b6a2e] bg-[#302611] p-3 text-sm text-[#f7d77f]">Falta configurar <code>APP_PASSWORD</code> en el entorno.</div>}
          <LoginForm/>
          <p className="login-security"><ShieldCheck size={15}/> Sesión privada y operaciones protegidas en el servidor.</p>
        </section>
      </div>
    </PageReveal>
  </main>;
}
