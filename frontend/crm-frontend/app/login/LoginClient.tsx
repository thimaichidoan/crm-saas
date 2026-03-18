  "use client";

  import { useState } from "react";
  import { API_URL } from "@/lib/api";

  export default function LoginClient() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/token/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Identifiants invalides");
        }

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        window.location.href = "/dashboard";
      } catch (err: unknown) {
        console.error("Erreur login :", err);
        const message =
          err instanceof Error ? err.message : "Erreur de connexion";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-800">Connexion</h1>

          {error && (
            <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="grid gap-4">
            <input
              type="text"
              placeholder="Nom d’utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </main>
    );
  }