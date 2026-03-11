import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "CRM SaaS",
  description: "CRM frontend with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-gray-100">
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1">
              <header className="border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">
                  CRM Full SaaS
                </h2>
              </header>

              <main className="p-8">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}