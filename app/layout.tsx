import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Progresso IA — Criador de Sites e Apps",description:"Crie sites e aplicações funcionais a partir de uma descrição."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}