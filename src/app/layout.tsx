import type { Metadata } from "next";
import "./globals.scss";
import { AuthProvider } from "@/contexts/AuthContext";
import { InteractionsProvider } from "@/contexts/InteractionsContext";
import { MediaTypeProvider } from "@/contexts/MediaTypeContext";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";

export const metadata: Metadata = {
  title: "MyLetterboxd - Rastreie filmes e séries",
  description: "Plataforma para rastrear, avaliar e descobrir filmes e séries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
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
