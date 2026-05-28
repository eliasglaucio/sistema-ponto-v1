import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Saira } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

const saira = Saira({ subsets: ["latin"], variable: "--font-saira" })

const iosevka = localFont({
	variable: "--font-sans",
	display: "swap",
	src: [
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-Light.ttf",
			weight: "300",
			style: "normal",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-LightItalic.ttf",
			weight: "300",
			style: "italic",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-Italic.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-MediumItalic.ttf",
			weight: "500",
			style: "italic",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./../public/fonts/Iosevka_Charon/IosevkaCharon-BoldItalic.ttf",
			weight: "700",
			style: "italic",
		},
	],
})

export const metadata: Metadata = {
	title: "Sistema de Ponto Digital - Ponto de Funcionários Simples",
	description: "Sistema de ponto com reconhecimento facial.",
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className={cn(
				"h-full antialiased",
				"font-sans",
				iosevka.variable,
				saira.variable
			)}>
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	)
}
