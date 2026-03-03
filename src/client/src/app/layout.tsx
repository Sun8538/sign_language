import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/ui/tailwind.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sign Language Translation System",
  description: "Real-time sign language fingerspelling recognition and 3D avatar signing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#06091a]`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
