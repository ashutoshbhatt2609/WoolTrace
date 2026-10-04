import type { Metadata } from "next";
import "./globals.css";
import "./pastoral.css";


export const metadata: Metadata = {
  title: "WoolTrace | Every fibre has a story",
  description: "Trace every wool batch from shearing to fabric and connect farmers directly with buyers.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
