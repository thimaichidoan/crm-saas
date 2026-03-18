"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api";

type Company = {
  id: number;
  name: string;
  website: string;
  industry: string;
  city: string;
};

function getCompanyInitial(name: string) {
  return (name?.[0] || "?").toUpperCase();
}

export default function CompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");

  const [search, setSearch] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCompanies = async (searchValue = "") => {
    try {
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const url = searchValue
        ? `${API_URL}/api/companies/?search=${encodeURIComponent(searchValue)}`
        : `${API_URL}/api/companies/`;

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      if (!res.ok) {
        await handleApiError(res, "Impossible de récupérer les entreprises");
        return;
      }

      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des entreprises";
      setError(message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCompanies(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const startEdit = (company: Company) => {
    setEditingCompanyId(company.id);
    setName(company.name || "");
    setWebsite(company.website || "");
    setIndustry(company.industry || "");
    setCity(company.city || "");
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingCompanyId(null);
    setName("");
    setWebsite("");
    setIndustry("");
    setCity("");
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingCompanyId(null);
    setName("");
    setWebsite("");
    setIndustry("");
    setCity("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingCompanyId !== null;

      const url = isEditing
        ? `${API_URL}/api/companies/${editingCompanyId}/`
        : `${API_URL}/api/companies/`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          website,
          industry,
          city,
        }),
      });

      if (!res.ok) {
        await handleApiError(
          res,
          isEditing
            ? "Impossible de modifier l’entreprise"
            : "Impossible de créer l’entreprise"
        );
        return;
      }

      cancelForm();
      await fetchCompanies(search);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : editingCompanyId !== null
            ? "Erreur lors de la modification de l’entreprise"
            : "Erreur lors de la création de l’entreprise";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      setError("");

      const res = await fetch(`${API_URL}/api/companies/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        await handleApiError(res, "Impossible de supprimer l’entreprise");
        return;
      }

      await fetchCompanies(search);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l’entreprise";
      setError(message);
    }
  };

  const companiesCountLabel = useMemo(() => {
    return `${companies.length} entreprise${companies.length > 1 ? "s" : ""}`;
  }, [companies]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_25%,_#f8fafc_55%,_#ffffff_100%)] p-6 md:p-8 xl:p-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-white/30 to-violet-50/70" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                CRM SaaS • Entreprises
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Gestion des entreprises
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Centralisez vos comptes clients, organisez vos entreprises et
                gardez une vue claire sur votre portefeuille commercial.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[360px]">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total affiché</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {companies.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Recherche</p>
                <p className="mt-2 truncate text-2xl font-bold text-blue-600">
                  {search ? search : "Toutes"}
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

        <section className="mt-8 rounded-[2rem] border border-gray-200/70 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Rechercher une entreprise par nom, secteur, ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                {companiesCountLabel}
              </span>

              <button
                onClick={openCreateForm}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                + Nouvelle entreprise
              </button>
            </div>
          </div>
        </section>

        {showForm && (
          <section className="mt-8 rounded-[2rem] border border-gray-200/70 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCompanyId
                    ? "Modifier l’entreprise"
                    : "Ajouter une entreprise"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Remplissez les informations principales de l’entreprise.
                </p>
              </div>

              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {editingCompanyId ? "Mode édition" : "Nouvelle entreprise"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Nom de l’entreprise
                </label>
                <input
                  type="text"
                  placeholder="Ex. TechNova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Site web
                </label>
                <input
                  type="text"
                  placeholder="Ex. https://entreprise.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Secteur / Industrie
                </label>
                <input
                  type="text"
                  placeholder="Ex. Formation, SaaS, Finance..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  placeholder="Ex. Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? editingCompanyId
                      ? "Modification..."
                      : "Création..."
                    : editingCompanyId
                      ? "Mettre à jour"
                      : "Ajouter l’entreprise"}
                </button>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8">
          {pageLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-[2rem] border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Aucune entreprise trouvée
              </h3>
              <p className="mt-2 text-gray-500">
                Ajoutez une première entreprise ou modifiez votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="group rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-100 text-lg font-bold text-blue-700">
                        {getCompanyInitial(company.name)}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-gray-900">
                          {company.name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {company.industry || "Secteur non renseigné"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      ID #{company.id}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Site web
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-gray-800">
                        {company.website || "Pas de site web"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Industrie
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {company.industry || "Industrie non renseignée"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Ville
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {company.city || "Ville non renseignée"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startEdit(company)}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => deleteCompany(company.id)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}