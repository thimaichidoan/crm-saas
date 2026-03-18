"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api";

type Stats = {
  total_contacts: number;
  total_companies: number;
  total_deals: number;
  conversion_rate: number | string;
  pending_tasks: number;
  completed_tasks: number;
  deals_won: number;
  deals_lost: number;
  revenue: number;
};

type RecentDeal = {
  id: number;
  title: string;
  value: number | string;
  stage: string;
};

function StatCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  accent:
    | "blue"
    | "violet"
    | "emerald"
    | "amber"
    | "rose"
    | "indigo"
    | "cyan";
}) {
  const accentMap = {
    blue: {
      ring: "ring-blue-100",
      badge: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    violet: {
      ring: "ring-violet-100",
      badge: "bg-violet-50 text-violet-700",
      dot: "bg-violet-500",
    },
    emerald: {
      ring: "ring-emerald-100",
      badge: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    amber: {
      ring: "ring-amber-100",
      badge: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    rose: {
      ring: "ring-rose-100",
      badge: "bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
    },
    indigo: {
      ring: "ring-indigo-100",
      badge: "bg-indigo-50 text-indigo-700",
      dot: "bg-indigo-500",
    },
    cyan: {
      ring: "ring-cyan-100",
      badge: "bg-cyan-50 text-cyan-700",
      dot: "bg-cyan-500",
    },
  };

  const styles = accentMap[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm ring-1 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.ring}`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-white to-gray-100 opacity-80" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}
          >
            KPI
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold tracking-tight text-gray-900">
              {value}
            </p>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>
          <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
        </div>
      </div>
    </div>
  );
}

function getStageLabel(stage: string) {
  switch (stage) {
    case "NEW":
      return "Nouveau";
    case "QUALIFIED":
      return "Qualifié";
    case "PROPOSAL":
      return "Proposition";
    case "NEGOTIATION":
      return "Négociation";
    case "WON":
      return "Gagné";
    case "LOST":
      return "Perdu";
    default:
      return stage || "Inconnu";
  }
}

function getStageBadgeClass(stage: string) {
  switch (stage) {
    case "NEW":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-100";
    case "QUALIFIED":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100";
    case "PROPOSAL":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-100";
    case "NEGOTIATION":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    case "WON":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "LOST":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    default:
      return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
}

function getStageProgress(stage: string) {
  switch (stage) {
    case "NEW":
      return 15;
    case "QUALIFIED":
      return 35;
    case "PROPOSAL":
      return 60;
    case "NEGOTIATION":
      return 80;
    case "WON":
      return 100;
    case "LOST":
      return 100;
    default:
      return 20;
  }
}

function formatCurrency(value: number | string) {
  return `${Number(value || 0).toLocaleString("fr-FR")} €`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        const token = localStorage.getItem("access_token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const [statsRes, dealsRes] = await Promise.all([
          fetch(`${API_URL}/api/analytics/stats/`, {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/deals/`, {
            method: "GET",
            headers: getAuthHeaders(),
            cache: "no-store",
          }),
        ]);

        if (!statsRes.ok) {
          await handleApiError(
            statsRes,
            "Impossible de récupérer les statistiques"
          );
          return;
        }

        if (!dealsRes.ok) {
          await handleApiError(
            dealsRes,
            "Impossible de récupérer les opportunités"
          );
          return;
        }

        const statsData = await statsRes.json();
        const dealsData = await dealsRes.json();

        const parsedDeals = Array.isArray(dealsData)
          ? dealsData
          : Array.isArray(dealsData?.results)
          ? dealsData.results
          : [];

        setStats(statsData);
        setRecentDeals(parsedDeals.slice(0, 5));
      } catch (err: unknown) {
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du tableau de bord";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const conversionRate = useMemo(() => {
    if (!stats) return 0;
    const rate = Number(stats.conversion_rate || 0);
    if (Number.isNaN(rate)) return 0;
    return Math.max(0, Math.min(100, rate));
  }, [stats]);

  const totalDealsAmount = useMemo(() => {
    return recentDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  }, [recentDeals]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_35%,_#ffffff_70%)] p-6 md:p-8 xl:p-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-white/30 to-violet-50/70" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                CRM SaaS • Dashboard
              </div>

              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Tableau de bord commercial
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Visualisez en un coup d’œil vos contacts, entreprises,
                opportunités et tâches pour piloter votre activité plus
                efficacement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[360px]">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">
                  Montant 5 dernières opportunités
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalDealsAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Conversion</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-3xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : stats ? (
          <>
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Contacts"
                value={stats.total_contacts}
                subtitle="Base de contacts"
                accent="blue"
              />
              <StatCard
                title="Entreprises"
                value={stats.total_companies}
                subtitle="Comptes enregistrés"
                accent="indigo"
              />
              <StatCard
                title="Opportunités"
                value={stats.total_deals}
                subtitle="Pipeline commercial"
                accent="cyan"
              />
              <StatCard
                title="Taux de conversion"
                value={`${conversionRate}%`}
                subtitle="Performance commerciale"
                accent="emerald"
              />
              <StatCard
                title="Tâches en attente"
                value={stats.pending_tasks}
                subtitle="Actions à traiter"
                accent="amber"
              />
              <StatCard
                title="Tâches terminées"
                value={stats.completed_tasks}
                subtitle="Suivi accompli"
                accent="rose"
              />
              <StatCard
                title="Gagnées"
                value={stats.deals_won}
                subtitle="Opportunités remportées"
                accent="emerald"
              />
              <StatCard
                title="Perdues"
                value={stats.deals_lost}
                subtitle="Opportunités perdues"
                accent="violet"
              />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-gray-200/70 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Résumé global
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Vue synthétique de l’activité commerciale
                    </p>
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    Temps réel
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">
                        Taux de conversion
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {conversionRate}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                        style={{ width: `${conversionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Opportunités gagnées / totales
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {stats.deals_won} / {stats.total_deals}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Tâches totales</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {stats.pending_tasks + stats.completed_tasks}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Revenu gagné</p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.revenue)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Opportunités perdues
                      </p>
                      <p className="mt-2 text-2xl font-bold text-rose-600">
                        {stats.deals_lost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200/70 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Dernières opportunités
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Opportunités les plus récentes dans le pipeline
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {recentDeals.length}
                  </span>
                </div>

                {recentDeals.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                    Aucune opportunité récente.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {recentDeals.map((deal) => {
                      const progress = getStageProgress(deal.stage);

                      return (
                        <div
                          key={deal.id}
                          className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="truncate text-base font-semibold text-gray-900">
                                  {deal.title || `Opportunité #${deal.id}`}
                                </p>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStageBadgeClass(
                                    deal.stage
                                  )}`}
                                >
                                  {getStageLabel(deal.stage)}
                                </span>
                              </div>

                              <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                                  <span>Avancement</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 rounded-2xl bg-blue-50 px-4 py-3 text-right">
                              <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                                Montant
                              </p>
                              <p className="mt-1 text-lg font-bold text-blue-700">
                                {formatCurrency(deal.value)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}