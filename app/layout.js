import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Navbar from "@/app/components/Navbar";
import GoogleTranslate from "@/app/components/GoogleTranslate";

export const metadata = {
    title: "Disasterly",
    description: "A Disaster relief web app",
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
            {/*<Navbar />*/}
            <GoogleTranslate />
            {children}
            <Analytics />
            <SpeedInsights />
        </Providers>
        </body>
        </html>
    );
}