import type { Metadata } from "next";
import Navbar from "./(layout)/Navbar";
import "@/styles/globals.scss";
import MainContainer from "./(layout)/MainContainer";

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
