import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TwentyFirstToolbar } from "@21st-extension/toolbar-next";
import { ReactPlugin } from "@21st-extension/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroupQuest",
  description: "Collaborative AI trip planning",
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
        {children}
        <TwentyFirstToolbar
          config={{
            plugins: [ReactPlugin],
          }}
        />
      </body>
    </html>
  );
}
