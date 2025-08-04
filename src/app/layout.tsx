import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'CineAssist',
  description: 'Navegue, solicite e gerencie seus filmes e séries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="font-body antialiased h-full">
        {children}
      </body>
    </html>
  );
}
