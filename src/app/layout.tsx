import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/app/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Session } from 'next-auth';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Магазин одежды",
  description: "Лучший магазин одежды с доставкой по всей России",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await getServerSession(authOptions)) as Session | null;

  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white">
        <Providers session={session}>
          <Navbar />
          <main className="flex-grow bg-white">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
