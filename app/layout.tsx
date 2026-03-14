import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "CSE Mentor AI",
  description: "Your AI-powered Computer Science mentor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
