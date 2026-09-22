import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/jersey-10";
import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import { MotionProvider } from "@/components/motion";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Minecraft Extremo", template: "%s · Minecraft Extremo" },
  description: "Tracker privado de nuestra serie Minecraft Hardcore.",
  applicationName: "Minecraft Extremo Tracker",
};

export const viewport: Viewport = { themeColor: "#09070f", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full"><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
