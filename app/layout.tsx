import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8 Марта — открытка со ссылкой",
  description:
    "Создайте поздравительную открытку с 8 Марта, сохраните текст в Postgres и поделитесь ссылкой.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
