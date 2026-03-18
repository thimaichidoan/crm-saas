"use client";

import { useEffect, useState } from "react";
import { DealFormData, Deal } from "../../../types/deal";
import { API_URL, getAuthHeaders, handleApiError } from "../../../lib/api";

type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
};

type Company = {
  id: number;
  name: string;
};

type Props = {
  onCreate: (data: {
    title: string;
    description: string | null;
    value: number;
    stage: string;
    contact: number | null;
    company: number | null;
    expected_close_date: string | null;
    is_active: boolean;
  }) => Promise<void>;
  onUpdate: (
    id: number,
    data: {
      title: string;
      description: string | null;
      value: number;
      stage: string;
      contact: number | null;
      company: number | null;
      expected_close_date: string | null;
      is_active: boolean;
    }
  ) => Promise<void>;
  editingDeal: Deal | null;
  onCancelEdit?: () => void;
};

const stageOptions = [
  { value: "NEW", label: "Nouveau" },
  { value: "QUALIFIED", label: "Qualifié" },
  { value: "PROPOSAL", label: "Proposition" },
  { value: "NEGOTIATION", label: "Négociation" },
  { value: "WON", label: "Gagné" },
  { value: "LOST", label: "Perdu" },
];

export default function DealForm({
  onCreate,
  onUpdate,
  editingDeal,
  onCancelEdit,
}: Props) {
  const emptyForm: DealFormData = {
    title: "",
    description: "",
    value: "",
    stage: "NEW",
    contact: "",
    company: "",
    expected_close_date: "",
    is_active: true,
  };

  const [form, setForm] = useState<DealFormData>(emptyForm);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showForm || editingDeal) {
      loadFormData();
    }
  }, [showForm, editingDeal]);

  useEffect(() => {
    if (editingDeal) {
      setForm({
        title: editingDeal.title || "",
        description: editingDeal.description || "",
        value: String(editingDeal.value ?? ""),
        stage: editingDeal.stage || "NEW",
        contact: editingDeal.contact ? String(editingDeal.contact) : "",
        company: editingDeal.company ? String(editingDeal.company) : "",
        expected_close_date: editingDeal.expected_close_date || "",
        is_active: editingDeal.is_active ?? true,
      });
      setShowForm(true);
    }
  }, [editingDeal]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [contactsRes, companiesRes] = await Promise.all([
        fetch(`${API_URL}/api/contacts/`, {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/companies/`, {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        }),
      ]);

      if (!contactsRes.ok) {
        await handleApiError(
          contactsRes,
          "Impossible de récupérer les contacts"
        );
        return;
      }

      if (!companiesRes.ok) {
        await handleApiError(
          companiesRes,
          "Impossible de récupérer les entreprises"
        );
        return;
      }

      const contactsData = await contactsRes.json();
      const companiesData = await companiesRes.json();

      const parsedContacts = Array.isArray(contactsData)
        ? contactsData
        : Array.isArray(contactsData?.results)
        ? contactsData.results
        : [];

      const parsedCompanies = Array.isArray(companiesData)
        ? companiesData
        : Array.isArray(companiesData?.results)
        ? companiesData.results
        : [];

      setContacts(parsedContacts);
      setCompanies(parsedCompanies);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du formulaire"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const cancel = () => {
    resetForm();
    setShowForm(false);
    onCancelEdit?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description ? form.description.trim() : null,
      value: form.value ? Number(form.value) : 0,
      stage: form.stage,
      contact: form.contact ? Number(form.contact) : null,
      company: form.company ? Number(form.company) : null,
      expected_close_date: form.expected_close_date || null,
      is_active: form.is_active,
    };

    try {
      setLoading(true);
      setError("");

      if (editingDeal) {
        await onUpdate(editingDeal.id, payload);
      } else {
        await onCreate(payload);
      }

      cancel();
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l’enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Gérer les opportunités
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez ou modifiez une opportunité du pipeline.
          </p>
        </div>

        {!editingDeal && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            + Nouvelle opportunité
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/80 via-white to-violet-50/80 px-6 py-5 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {editingDeal ? "Modification" : "Nouveau deal"}
                </div>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  {editingDeal
                    ? "Modifier l’opportunité"
                    : "Créer une opportunité"}
                </h3>
              </div>

              <button
                type="button"
                onClick={cancel}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {loadingData ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Titre de l’opportunité
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Étape du pipeline
                    </label>
                    <select
                      name="stage"
                      value={form.stage}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      {stageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Contact associé
                    </label>
                    <select
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choisir un contact</option>
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Entreprise associée
                    </label>
                    <select
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choisir une entreprise</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Date de clôture prévue
                    </label>
                    <input
                      type="date"
                      name="expected_close_date"
                      value={form.expected_close_date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Opportunité active
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Enregistrement..."
                      : editingDeal
                      ? "Enregistrer les modifications"
                      : "Créer l’opportunité"}
                  </button>

                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}