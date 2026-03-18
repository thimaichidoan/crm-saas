"use client";

import { useEffect, useMemo, useState } from "react";
import DealCard from "./components/DealCard";
import DealForm from "./components/DealForm";
import { Deal } from "../../types/deal";
import {
  fetchDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../../lib/api";

type CreateDealPayload = {
  title: string;
  description: string | null;
  value: number;
  stage: string;
  contact: number | null;
  company: number | null;
  expected_close_date: string | null;
  is_active: boolean;
};

const stages: Deal["stage"][] = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const stageLabels: Record<Deal["stage"], string> = {
  NEW: "Nouveau",
  QUALIFIED: "Qualifié",
  PROPOSAL: "Proposition",
  NEGOTIATION: "Négociation",
  WON: "Gagné",
  LOST: "Perdu",
};

function getColumnDotClass(stage: Deal["stage"]) {
  switch (stage) {
    case "NEW":
      return "bg-blue-500";
    case "QUALIFIED":
      return "bg-indigo-500";
    case "PROPOSAL":
      return "bg-violet-500";
    case "NEGOTIATION":
      return "bg-amber-500";
    case "WON":
      return "bg-emerald-500";
    case "LOST":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeals = async () => {
    try {
      setError("");
      const data = await fetchDeals();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des opportunités";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleCreate = async (data: CreateDealPayload) => {
    try {
      await createDeal(data);
      await loadDeals();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l’opportunité";
      setError(message);
    }
  };

  const handleMove = async (id: number, newStage: Deal["stage"]) => {
    try {
      await updateDeal(id, { stage: newStage });
      await loadDeals();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l’opportunité";
      setError(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDeal(id);
      await loadDeals();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l’opportunité";
      setError(message);
    }
  };

  const totalAmount = useMemo(() => {
    return deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  }, [deals]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_25%,_#f8fafc_55%,_#ffffff_100%)] p-6 md:p-8 xl:p-10">
      <div className="mx-auto max-w-[1800px]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-white/30 to-violet-50/70" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                CRM SaaS • Pipeline des opportunités
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Pipeline commercial
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Visualisez vos opportunités à chaque étape du cycle de vente et
                pilotez votre activité commerciale plus efficacement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[380px]">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total opportunités</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {deals.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Montant total</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {totalAmount.toLocaleString("fr-FR")} €
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

        <div className="mt-8">
          <DealForm onCreate={handleCreate} />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-[2rem] border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {stages.map((stage) => {
                const dealsByStage = deals.filter((deal) => deal.stage === stage);
                const totalByStage = dealsByStage.reduce(
                  (sum, deal) => sum + Number(deal.value || 0),
                  0
                );

                return (
                  <section
                    key={stage}
                    className="min-h-[420px] rounded-[2rem] border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur"
                  >
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full ${getColumnDotClass(
                            stage
                          )}`}
                        />
                        <h2 className="text-lg font-bold text-gray-900">
                          {stageLabels[stage]}
                        </h2>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          {dealsByStage.length}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-500">
                        {totalByStage.toLocaleString("fr-FR")} € au total
                      </p>
                    </div>

                    <div className="space-y-4">
                      {dealsByStage.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onMove={handleMove}
                          onDelete={handleDelete}
                        />
                      ))}

                      {dealsByStage.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                          Aucune opportunité
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}