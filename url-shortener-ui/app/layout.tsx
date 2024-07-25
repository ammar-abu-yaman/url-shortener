import type { Metadata } from "next";
import Navbar from "./_components/layout/Navbar";
import MainContainer from "./_components/layout/MainContainer";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Ammar's URL Shortener",
  description: "Shortens URLs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
            <Navbar/>
            <MainContainer>
                {children}
            </MainContainer>
        </body>
    </html>
  );
}
