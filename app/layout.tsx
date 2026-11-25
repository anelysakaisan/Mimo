import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";
import "./cart.css";
import "./checkout.css";
import "./inspiration.css";
import "./responsive-store.css";
import "./product-detail.css";
import "./polish.css";
import "./media-admin.css";
import "./catalog.css";

export const metadata: Metadata = {
  title: "Mimo Cherry | Kits e scoops de papelaria",
  description: "Kits e scoops de papelaria criativos para estudar, organizar e presentear.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
