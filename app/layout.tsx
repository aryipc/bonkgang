
import React from "react";
import "./globals.css";

export const metadata = {
  title: "LetsBonkGang Generator",
  description: "An application that uses Google's Gemini and Imagen models to turn any image into a unique, cartoon-style Bonk Gang dog character holding a baseball bat.",
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
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}