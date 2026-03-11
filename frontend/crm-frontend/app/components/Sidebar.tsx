"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuth(!!token);
  }, []);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800">CRM SaaS</h1>
        <p className="mt-1 text-sm text-gray-500">Tableau de bord commercial</p>
      </div>

      <nav className="flex flex-1 flex-col justify-between p-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
          >
            Accueil
          </Link>

          {isAuth && (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/contacts"
                className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Contacts
              </Link>

              <Link
                href="/companies"
                className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Entreprises
              </Link>

              <Link
                href="/leads"
                className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Leads
              </Link>

              <Link
                href="/tasks"
                className="rounded-xl px-4 py-3 font-medium text-gray-800 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Tâches
              </Link>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          {!isAuth ? (
            <Link
              href="/login"
              className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Connexion
            </Link>
          ) : (
            <LogoutButton />
          )}
        </div>
      </nav>
    </aside>
  );
}