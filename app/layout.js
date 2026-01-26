import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdProvider from "./AntdProvider";
import AuthProvider from "./AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Budget Management",
  description: "Personal budget management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AntdProvider>{children}</AntdProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
