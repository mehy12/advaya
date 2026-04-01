import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NeptuneTrace — Marine Pollution Intelligence",
  description:
    "Detect pollution, trace its source, predict biodiversity impact. Real-time marine intelligence for the Gulf of Mannar.",
  keywords: [
    "marine pollution",
    "ocean monitoring",
    "biodiversity",
    "Gulf of Mannar",
    "environmental intelligence",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main style={{ paddingTop: "var(--nav-height)" }}>{children}</main>
      </body>
    </html>
  );
}
