import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.scss";
import { AuthProvider } from "@/contexts/AuthContext";
import { InteractionsProvider } from "@/contexts/InteractionsContext";
import { MediaTypeProvider } from "@/contexts/MediaTypeContext";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineSync - Seu universo cinematográfico, em sintonia",
  description: "Track. Review. Sync. Descubra e avalie filmes e séries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <AuthProvider>
          <InteractionsProvider>
            <MediaTypeProvider>
              <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
              <NavbarWrapper />
              <main id="main-content">{children}</main>
            </MediaTypeProvider>
          </InteractionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
