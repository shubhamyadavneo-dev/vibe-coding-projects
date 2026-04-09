// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";
import Aurora from "./components/Aurora/Aurora";

import Sidebar from "./components/Sidebar/Sidebar";

export const metadata: Metadata = {
  title: "TodoDash - SaaS Task Manager",
  description: "Modern todo dashboard with Aurora background",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased text-white">
        <div className="relative min-h-full overflow-hidden bg-[#07111f]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.14),_transparent_28%),radial-gradient(circle_at_bottom_center,_rgba(251,191,36,0.08),_transparent_35%)]" />
          <Aurora
            colorStops={["#0ea5e9", "#14b8a6", "#f59e0b"]}
            amplitude={0.9}
            blend={0.4}
            speed={0.8}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(7,17,31,0.2)_0%,rgba(7,17,31,0.72)_70%,rgba(7,17,31,0.92)_100%)]" />
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 pb-8 pt-20 lg:px-8 lg:pb-10 lg:pt-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
