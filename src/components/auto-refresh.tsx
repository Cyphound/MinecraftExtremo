"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function AutoRefresh({interval=5000}:{interval?:number}) { const router=useRouter(); useEffect(()=>{const id=window.setInterval(()=>router.refresh(),interval);return()=>window.clearInterval(id);},[interval,router]); return null; }
