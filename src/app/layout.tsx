import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Minecraft Extremo", template: "%s · Minecraft Extremo" },
  description: "Tracker privado de nuestra serie Minecraft Hardcore.",
  applicationName: "Minecraft Extremo Tracker",
};

export const viewport: Viewport = { themeColor: "#080a09", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
