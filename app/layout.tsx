import "./globals.css";
import { Public_Sans } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata = {
  title: 'Local Agent - 你的智能助手',
  description: '基于本地大语言模型的智能助手，帮助你更好地使用',
  keywords: ['AI', 'Agent', 'Assistant', 'Blockchain'],
  authors: [{ name: 'Euraxluo<euraxluo@gmail.com>' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${publicSans.className} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
