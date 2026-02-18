import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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


export const metadata: Metadata = {
  title: "사람의 탈 | 공식 굿즈샵",
  description: "사람의 탈 공식 굿즈샵",
  openGraph: {
    title: "사람의 탈 | 공식 굿즈샵",
    description: "사람의 탈 공식 굿즈샵",
    images: [
      "https://vtimxcmadyyqvuxftrhy.supabase.co/storage/v1/object/public/images/uploads/1771252726403-z127l9.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      "https://vtimxcmadyyqvuxftrhy.supabase.co/storage/v1/object/public/images/uploads/1771252726403-z127l9.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
