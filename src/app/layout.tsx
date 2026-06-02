import type { Metadata } from "next";
import { Inter, Poppins, Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading" 
});
const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-soft" 
});

export const metadata: Metadata = {
  title: "monk mode | Self-Mastery System",
  description: "The all-in-one system for focus, habits, growth, and self-mastery.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#F6C1CC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          poppins.variable,
          nunito.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
