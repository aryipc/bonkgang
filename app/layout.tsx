
<<<<<<< HEAD
=======

>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
import React from "react";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata = {
<<<<<<< HEAD
  title: "LetsBonkGang Official Register",
  description: "Register your official gang member for LetsBonkGang. Upload an image, select your gang, and immortalize your character.",
=======
  title: "LetsBonkGang Official prompt page",
  description: "Upload an image and select a style to generate a high-quality prompt for AI image models.",
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
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