import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KeeperHub",
  description: "Platform manajemen aset untuk keluarga HNWI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
