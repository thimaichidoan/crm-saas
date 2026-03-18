"use client";

import { useState } from "react";
import { sendEmail } from "@/lib/email";

type EmailHistoryItem = {
  id: number;
  to: string;
  subject: string;
  message: string;
  sentAt: string;
  status: "success" | "error";
};

export default function EmailingPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<EmailHistoryItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccess("");
      setError("");

      await sendEmail({ to, subject, message });

      const newHistoryItem: EmailHistoryItem = {
        id: Date.now(),
        to,
        subject,
        message,
        sentAt: new Date().toLocaleString("fr-FR"),
        status: "success",
      };

      setHistory((prev) => [newHistoryItem, ...prev]);

      setSuccess("Email envoyé avec succès.");
      setTo("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de l’envoi";

      setError(errorMessage);

      const failedHistoryItem: EmailHistoryItem = {
        id: Date.now(),
        to,
        subject,
        message,
        sentAt: new Date().toLocaleString("fr-FR"),
        status: "error",
      };

      setHistory((prev) => [failedHistoryItem, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            CRM · Emailing
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Centre d’emailing
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Envoyez vos emails rapidement et gardez un historique clair de vos
            derniers envois.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Formulaire */}
          <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Nouvel email
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Remplissez les informations ci-dessous pour envoyer un email.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 sm:block">
                {loading ? "Envoi en cours..." : "Prêt à envoyer"}
              </div>
            </div>

            {success && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Destinataire
                  </label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="contact@email.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sujet de l’email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Votre message..."
                    rows={10}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Vérifiez le destinataire et le contenu avant l’envoi.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Envoyer l’email"}
                </button>
              </div>
            </form>
          </section>

          {/* Historique */}
          <aside className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Historique
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Retrouvez ici les derniers emails envoyés depuis cette session.
              </p>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Aucun email envoyé pour le moment
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Votre historique apparaîtra ici après le premier envoi.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.subject || "(Sans sujet)"}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          À : {item.to}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status === "success" ? "Envoyé" : "Échec"}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm text-slate-600">
                      {item.message}
                    </p>

                    <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-400">
                      {item.sentAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}