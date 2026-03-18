"use client";

import { Deal, DealStage } from "../../../types/deal";

type Props = {
  deal: Deal;
  onMove: (id: number, newStage: DealStage) => void;
  onDelete: (id: number) => void;
  onEdit: (deal: Deal) => void;
};

const stages: DealStage[] = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const stageLabels: Record<DealStage, string> = {
  NEW: "Nouveau",
  QUALIFIED: "Qualifié",
  PROPOSAL: "Proposition",
  NEGOTIATION: "Négociation",
  WON: "Gagné",
  LOST: "Perdu",
};

function getBadgeClass(stage: DealStage) {
  switch (stage) {
    case "NEW":
      return "border border-blue-200 bg-blue-50 text-blue-700";
    case "QUALIFIED":
      return "border border-indigo-200 bg-indigo-50 text-indigo-700";
    case "PROPOSAL":
      return "border border-violet-200 bg-violet-50 text-violet-700";
    case "NEGOTIATION":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "WON":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "LOST":
      return "border border-red-200 bg-red-50 text-red-700";
    default:
      return "border border-gray-200 bg-gray-100 text-gray-700";
  }
}

function getProgressBarClass(stage: DealStage) {
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

function getProbability(stage: DealStage) {
  switch (stage) {
    case "NEW":
      return 20;
    case "QUALIFIED":
      return 40;
    case "PROPOSAL":
      return 60;
    case "NEGOTIATION":
      return 80;
    case "WON":
      return 100;
    case "LOST":
      return 0;
    default:
      return 0;
  }
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Non définie";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DealCard({ deal, onMove, onDelete, onEdit }: Props) {
  const probability = getProbability(deal.stage);

  return (
    <div
      onClick={() => onEdit(deal)}
      className="cursor-pointer rounded-[1.6rem] border border-gray-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
            deal.stage
          )}`}
        >
          {stageLabels[deal.stage]}
        </span>

        <span className="text-xs font-medium text-gray-400">#{deal.id}</span>
      </div>

      <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900">
        {deal.title || `Opportunité #${deal.id}`}
      </h3>

      {(deal.company_name || deal.contact_name || deal.owner_username) && (
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          {deal.company_name && (
            <p>
              <span className="font-medium text-gray-800">Entreprise :</span>{" "}
              {deal.company_name}
            </p>
          )}

          {deal.contact_name && (
            <p>
              <span className="font-medium text-gray-800">Contact :</span>{" "}
              {deal.contact_name}
            </p>
          )}

          {!deal.contact_name && deal.owner_username && (
            <p>
              <span className="font-medium text-gray-800">Responsable :</span>{" "}
              {deal.owner_username}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Montant
        </p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {Number(deal.value || 0).toLocaleString("fr-FR")} €
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-500">Probabilité</span>
          <span className="font-semibold text-gray-700">{probability}%</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-gray-200">
          <div
            className={`h-2.5 rounded-full transition-all ${getProgressBarClass(
              deal.stage
            )}`}
            style={{ width: `${probability}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Clôture prévue : {formatDate(deal.expected_close_date)}
        </p>
      </div>

      <div
        className="mt-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={deal.stage}
          onChange={(e) => onMove(deal.id, e.target.value as DealStage)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stageLabels[stage]}
            </option>
          ))}
        </select>

        <button
          onClick={() => onDelete(deal.id)}
          className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}