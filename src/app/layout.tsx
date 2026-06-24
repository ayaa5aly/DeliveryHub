import type { Metadata } from "next";
import App from "@/App";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DeliveryHub Admin",
  description: "DeliveryHub administration panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
}
