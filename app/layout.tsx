import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local'
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bmkKubulim = localFont({
  src: './fonts/BMKkubulim.otf',
  variable: "--font-bmk",
})



export const metadata: Metadata = {
  title: "사람의 탈 | 공식 굿즈샵",
  description: "사람의 탈 공식 굿즈샵",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bmkKubulim.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
