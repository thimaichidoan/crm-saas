"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  contact: number;
  status: string;
  source: string;
  value_estimate: string | number | null;
};

export default function LeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("new");
  const [source, setSource] = useState("");
  const [valueEstimate, setValueEstimate] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = async (filterStatus = "") => {
    try {
      setError("");

      const url = filterStatus
        ? `http://127.0.0.1:8000/api/leads/?status=${encodeURIComponent(filterStatus)}`
        : "http://127.0.0.1:8000/api/leads/";

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Impossible de récupérer les leads");
      }

      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des leads");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const startEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setContact(String(lead.contact));
    setStatus(lead.status || "new");
    setSource(lead.source || "");
    setValueEstimate(
      lead.value_estimate !== null && lead.value_estimate !== undefined
        ? String(lead.value_estimate)
        : ""
    );
  };

  const cancelEdit = () => {
    setEditingLeadId(null);
    setContact("");
    setStatus("new");
    setSource("");
    setValueEstimate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingLeadId !== null;

      const url = isEditing
        ? `http://127.0.0.1:8000/api/leads/${editingLeadId}/`
        : "http://127.0.0.1:8000/api/leads/";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: Number(contact),
          status,
          source,
          value_estimate: valueEstimate ? Number(valueEstimate) : null,
        }),
      });

      if (!res.ok) {
        throw new Error(
          isEditing
            ? "Impossible de modifier le lead"
            : "Impossible de créer le lead"
        );
      }

      setContact("");
      setStatus("new");
      setSource("");
      setValueEstimate("");
      setEditingLeadId(null);

      await fetchLeads(statusFilter);
    } catch (err) {
      console.error(err);
      setError(
        editingLeadId !== null
          ? "Erreur lors de la modification du lead"
          : "Erreur lors de la création du lead"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: number) => {
    try {
      setError("");

      const res = await fetch(`http://127.0.0.1:8000/api/leads/${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer le lead");
      }

      await fetchLeads(statusFilter);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du lead");
    }
  };

  const getStatusColor = (leadStatus: string) => {
    switch (leadStatus) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "progress":
        return "bg-yellow-100 text-yellow-700";
      case "won":
        return "bg-green-100 text-green-700";
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">Leads</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value);
              fetchLeads(value);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-800"
          >
            <option value="">Tous les statuts</option>
            <option value="new">New</option>
            <option value="progress">Progress</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="mb-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            {editingLeadId ? "Modifier le lead" : "Ajouter un lead"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              placeholder="ID du contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800"
            >
              <option value="new">New</option>
              <option value="progress">Progress</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <input
              type="text"
              placeholder="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <input
              type="number"
              placeholder="Valeur estimée"
              value={valueEstimate}
              onChange={(e) => setValueEstimate(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingLeadId
                    ? "Modification..."
                    : "Création..."
                  : editingLeadId
                  ? "Mettre à jour"
                  : "Ajouter lead"}
              </button>

              {editingLeadId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md"
            >
              <h2 className="text-xl font-bold text-gray-800">
                Lead #{lead.id}
              </h2>

              <p className="mt-2 text-gray-600">Contact ID : {lead.contact}</p>
              <p className="text-gray-600">
                Source : {lead.source || "Non renseignée"}
              </p>
              <p className="text-gray-600">
                Valeur : {lead.value_estimate ?? "Non renseignée"}
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                  lead.status
                )}`}
              >
                {lead.status}
              </span>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => startEdit(lead)}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteLead(lead.id)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}