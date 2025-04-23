import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import localFont from "next/font/local";

const nokiaFont = localFont({
	src: "./nokia.ttf",
	display: "swap",
	variable: "--font-nokia",
});

export const metadata: Metadata = {
	title: "3310 - j3c7",
	description: "The best phone ever?",
	openGraph: {
		images: [{ url: "/cover.png?v=2" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={nokiaFont.variable}>
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
