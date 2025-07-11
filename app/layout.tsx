
import React from "react";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata = {
  title: "LetsBonkGang Official prompt page",
  description: "Upload an image to get a prompt and generate your own LetsBonkGang member.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}