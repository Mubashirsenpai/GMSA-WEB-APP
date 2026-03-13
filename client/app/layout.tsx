import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "GMSA UDS NYC | Ghana Muslim Students' Association",
  description: "Ghana Muslim Students' Association - University for Development Studies, Nyankpala Campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
