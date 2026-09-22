"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleCheck, Skull, X } from "lucide-react";
import { loginAction, registerDeathAction, updatePunishmentAction, updateRunAction, type ActionState } from "@/app/actions";
import { DEATH_CAUSES, DIMENSIONS, PROGRESS_STAGES } from "@/lib/game-config";
import type { Player, Punishment, Run } from "@/types/database";

function Submit({ children, className = "btn btn-primary", disabled = false }: { children: ReactNode; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending || disabled} type="submit">{pending ? "Guardando…" : children}</button>;
}

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  return <p aria-live="polite" className={`rounded-lg px-3 py-2 text-sm ${state.error ? "bg-[#3d1f48] text-[#e5adff]" : "bg-[#222344] text-[#bdc8ff]"}`}>{state.error ?? state.success}</p>;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return <form action={action} className="grid gap-4"><label className="label">Contraseña compartida<input className="input" name="password" type="password" autoComplete="current-password" required autoFocus placeholder="••••••••••••"/></label><Message state={state}/><button className="btn btn-primary w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar al panel"}</button></form>;
}

export function DeathDialog({ players, disabled }: { players: Player[]; disabled?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [cause, setCause] = useState("");
  const [state, action, pending] = useActionState(registerDeathAction, undefined);
  return <>
    <button onClick={()=>dialog.current?.showModal()} className="btn btn-danger danger-glow w-full py-4 text-base sm:w-auto sm:px-8"><Skull size={21}/> REGISTRAR MUERTE</button>
    <dialog ref={dialog} className="glass-shell m-auto max-h-[92vh] w-[min(94vw,620px)] overflow-y-auto rounded-[1.6rem] p-0 text-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl border border-[#76518a] bg-[#321d40] text-[#d996ff]"><Skull size={21}/></span><div><p className="eyebrow mb-1">Fin del intento</p><h2 className="display-font text-2xl font-bold">Registrar muerte</h2></div></div><button onClick={()=>dialog.current?.close()} className="btn btn-ghost size-10 min-h-0 p-0" aria-label="Cerrar"><X size={18}/></button></div>
      <form action={action} className="grid gap-5 p-5 sm:p-6" onSubmit={()=>{ if(!state?.error) window.setTimeout(()=>dialog.current?.close(),600); }}>
        <label className="label">Jugador que murió<select className="input" name="playerId" required defaultValue=""><option value="" disabled>Selecciona un jugador</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}{p.nickname?` · ${p.nickname}`:""}</option>)}</select></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="label">Causa<select className="input" name="cause" required value={cause} onChange={e=>setCause(e.target.value)}><option value="" disabled>Selecciona una causa</option>{DEATH_CAUSES.map(item=><option key={item}>{item}</option>)}</select></label><label className="label">Dimensión<select className="input" name="dimension" required defaultValue="Overworld">{DIMENSIONS.map(item=><option key={item}>{item}</option>)}</select></label></div>
        {cause==="Otra"&&<label className="label">Causa personalizada<input className="input" name="customCause" required maxLength={80} placeholder="¿Qué pasó?"/></label>}
        <label className="label">Progreso alcanzado<select className="input" name="progressStage" required defaultValue="0">{PROGRESS_STAGES.map((item,index)=><option key={item} value={index}>{index+1}. {item}</option>)}</select></label>
        <label className="label">Comentario opcional<textarea className="input min-h-24 resize-y" name="comment" maxLength={500} placeholder="se tiró a una ravine sin agua…"/></label>
        <Message state={state}/>{disabled&&<p className="text-xs text-[#f6c85f]">Vista previa: conecta Supabase para guardar.</p>}<div className="grid gap-3 sm:grid-cols-2"><button type="button" className="btn btn-ghost" onClick={()=>dialog.current?.close()}>Cancelar</button><button type="submit" disabled={pending||disabled} className="btn btn-danger">{pending?"Registrando…":"Confirmar muerte"}</button></div>
      </form>
    </dialog>
  </>;
}

function localDateTime(value: string | null) { if(!value) return ""; const date=new Date(value); return new Date(date.valueOf()-date.getTimezoneOffset()*60000).toISOString().slice(0,16); }

export function RunEditForm({ run, players, disabled }: { run: Run; players: Player[]; disabled?: boolean }) {
  const [state, action] = useActionState(updateRunAction, undefined);
  return <form action={action} className="panel grid gap-5 p-5 sm:p-6"><input type="hidden" name="runId" value={run.id}/><div className="grid gap-5 sm:grid-cols-2"><label className="label">Inicio<input className="input" name="startedAt" type="datetime-local" defaultValue={localDateTime(run.started_at)} required/></label><label className="label">Término<input className="input" name="endedAt" type="datetime-local" defaultValue={localDateTime(run.ended_at)}/></label><label className="label">Estado<select className="input" name="status" defaultValue={run.status}><option value="active">En curso</option><option value="failed">Fallido</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select></label><label className="label">Progreso<select className="input" name="progressStage" defaultValue={run.progress_stage}>{PROGRESS_STAGES.map((item,index)=><option key={item} value={index}>{item}</option>)}</select></label><label className="label">Jugador muerto<select className="input" name="deadPlayerId" defaultValue={run.dead_player_id??""}><option value="">Ninguno</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="label">Dimensión<select className="input" name="dimension" defaultValue={run.dimension??""}><option value="">Ninguna</option>{DIMENSIONS.map(item=><option key={item}>{item}</option>)}</select></label></div><label className="label">Causa de muerte<input className="input" name="deathCause" maxLength={80} defaultValue={run.death_cause??""}/></label><label className="label">Comentario<textarea className="input min-h-24" name="comment" maxLength={500} defaultValue={run.comment??""}/></label><Message state={state}/><Submit className="btn btn-primary justify-self-start" >Guardar corrección</Submit>{disabled&&<p className="text-sm text-[#f6c85f]">Conecta Supabase para editar.</p>}</form>;
}

export function PunishmentForm({ punishment, disabled }: { punishment: Punishment; disabled?: boolean }) {
  const [state, action] = useActionState(updatePunishmentAction, undefined);
  return <form action={action} className="mt-4 grid gap-3"><input type="hidden" name="id" value={punishment.id}/><textarea className="input min-h-20" name="note" maxLength={160} defaultValue={punishment.instagram_note??""} placeholder="Texto de la Nota de Instagram"/><div className="flex flex-wrap gap-2"><select className="input max-w-44" name="status" defaultValue={punishment.status}><option value="pending">Pendiente</option><option value="completed">Completado</option></select><Submit className="btn btn-primary"><CircleCheck size={17}/> Guardar</Submit></div><Message state={state}/>{disabled&&<p className="text-xs text-[#f6c85f]">Demo: el formulario se habilita al conectar Supabase.</p>}</form>;
}
