"use client";
import { useEffect,useState } from "react";
import { formatClock } from "@/lib/format";
export function ElapsedTime({startedAt,className}:{startedAt:string;className?:string}) { const [elapsed,setElapsed]=useState(0); useEffect(()=>{const update=()=>setElapsed(Math.max(0,Math.floor((Date.now()-new Date(startedAt).valueOf())/1000)));update();const timer=window.setInterval(update,1000);return()=>window.clearInterval(timer);},[startedAt]); return <span className={className}>{formatClock(elapsed)}</span>; }
