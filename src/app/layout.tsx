import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AppToaster } from "@/components/AppToaster";
import { AuthToastListener } from "@/components/AuthToastListener";
import { SupabaseUserSync } from "@/components/SupabaseUserSync";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeAI",
  description: "Optimize your resume with AI — ATS score and actionable insights",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ResumeAI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const shell = (
    <>
      {children}
      <PwaInstallButton />
      <ServiceWorkerRegister />
      <AppToaster />
      {publishableKey ? (
        <>
          <AuthToastListener />
          <SupabaseUserSync />
        </>
      ) : null}
    </>
  );

  const content = publishableKey ? (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#f97316",
          colorTextOnPrimaryBackground: "#431407",
        },
      }}
    >
      {shell}
    </ClerkProvider>
  ) : (
    shell
  );

  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${inter.className} antialiased`}>{content}</body>
    </html>
  );
}
