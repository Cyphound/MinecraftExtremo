"use client";

import type { ReactNode } from "react";
import { PageReveal } from "@/components/motion";

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <PageReveal>{children}</PageReveal>;
}
