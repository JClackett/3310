import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
	title: "3310 - j3c7",
	description: "The best phone ever?",
	openGraph: {
		images: [{ url: "/cover.png" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
