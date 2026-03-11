"use client";

import { useEffect, useState } from "react";

type Company = {
  id: number;
  name: string;
  website: string;
  industry: string;
  city: string;
};

export default function CompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");

  const [search, setSearch] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCompanies = async (searchValue = "") => {
    try {
      setError("");

      const url = searchValue
        ? `http://127.0.0.1:8000/api/companies/?search=${encodeURIComponent(searchValue)}`
        : "http://127.0.0.1:8000/api/companies/";

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Impossible de récupérer les entreprises");
      }

      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des entreprises");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const startEdit = (company: Company) => {
    setEditingCompanyId(company.id);
    setName(company.name || "");
    setWebsite(company.website || "");
    setIndustry(company.industry || "");
    setCity(company.city || "");
  };

  const cancelEdit = () => {
    setEditingCompanyId(null);
    setName("");
    setWebsite("");
    setIndustry("");
    setCity("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingCompanyId !== null;

      const url = isEditing
        ? `http://127.0.0.1:8000/api/companies/${editingCompanyId}/`
        : "http://127.0.0.1:8000/api/companies/";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          website,
          industry,
          city,
        }),
      });

      if (!res.ok) {
        throw new Error(
          isEditing
            ? "Impossible de modifier l’entreprise"
            : "Impossible de créer l’entreprise"
        );
      }

      setName("");
      setWebsite("");
      setIndustry("");
      setCity("");
      setEditingCompanyId(null);

      await fetchCompanies(search);
    } catch (err) {
      console.error(err);
      setError(
        editingCompanyId !== null
          ? "Erreur lors de la modification de l’entreprise"
          : "Erreur lors de la création de l’entreprise"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      setError("");

      const res = await fetch(`http://127.0.0.1:8000/api/companies/${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer l’entreprise");
      }

      await fetchCompanies(search);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression de l’entreprise");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">Entreprises</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              fetchCompanies(value);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
          />
        </div>

        <div className="mb-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            {editingCompanyId ? "Modifier l’entreprise" : "Ajouter une entreprise"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              placeholder="Nom entreprise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Industrie"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingCompanyId
                    ? "Modification..."
                    : "Création..."
                  : editingCompanyId
                  ? "Mettre à jour"
                  : "Ajouter entreprise"}
              </button>

              {editingCompanyId && (
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
          {companies.map((company) => (
            <div
              key={company.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md"
            >
              <h2 className="text-xl font-bold text-gray-800">
                {company.name}
              </h2>

              <p className="mt-2 text-gray-600">
                {company.website || "Pas de site web"}
              </p>

              <p className="text-gray-600">
                {company.industry || "Industrie non renseignée"}
              </p>

              <p className="text-gray-600">
                {company.city || "Ville non renseignée"}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => startEdit(company)}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteCompany(company.id)}
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