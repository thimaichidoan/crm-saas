"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api";

type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  company: number | null;
  company_name?: string;
  contact_type: "PROSPECT" | "CLIENT" | "PARTNER";
  notes: string;
};

type Company = {
  id: number;
  name: string;
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function getContactTypeLabel(type: string) {
  switch (type) {
    case "PROSPECT":
      return "Prospect";
    case "CLIENT":
      return "Client";
    case "PARTNER":
      return "Partenaire";
    default:
      return type || "Inconnu";
  }
}

function getContactTypeBadgeClass(type: string) {
  switch (type) {
    case "PROSPECT":
      return "border border-blue-200 bg-blue-50 text-blue-700";
    case "CLIENT":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PARTNER":
      return "border border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border border-gray-200 bg-gray-100 text-gray-700";
  }
}

export default function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [contactType, setContactType] = useState<
    "PROSPECT" | "CLIENT" | "PARTNER"
  >("PROSPECT");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContacts = async (searchValue = "") => {
    try {
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const url = searchValue
        ? `${API_URL}/api/contacts/?search=${encodeURIComponent(searchValue)}`
        : `${API_URL}/api/contacts/`;

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      if (!res.ok) {
        await handleApiError(res, "Impossible de récupérer les contacts");
        return;
      }

      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des contacts";
      setError(message);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/companies/`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement entreprises :", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const startCreate = () => {
    setEditingContactId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setContactType("PROSPECT");
    setNotes("");
    setShowForm(true);
  };

  const startEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setFirstName(contact.first_name || "");
    setLastName(contact.last_name || "");
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setCompany(contact.company ? String(contact.company) : "");
    setContactType(contact.contact_type || "PROSPECT");
    setNotes(contact.notes || "");
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingContactId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setContactType("PROSPECT");
    setNotes("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingContactId !== null;

      const url = isEditing
        ? `${API_URL}/api/contacts/${editingContactId}/`
        : `${API_URL}/api/contacts/`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone,
          company: company ? Number(company) : null,
          contact_type: contactType,
          notes,
        }),
      });

      if (!res.ok) {
        await handleApiError(
          res,
          isEditing
            ? "Impossible de modifier le contact"
            : "Impossible de créer le contact"
        );
        return;
      }

      cancelForm();
      await fetchContacts(search);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : editingContactId !== null
            ? "Erreur lors de la modification du contact"
            : "Erreur lors de la création du contact";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: number) => {
    try {
      setError("");

      const res = await fetch(`${API_URL}/api/contacts/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        await handleApiError(res, "Impossible de supprimer le contact");
        return;
      }

      await fetchContacts(search);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du contact";
      setError(message);
    }
  };

  const contactsCountLabel = useMemo(() => {
    return `${contacts.length} contact${contacts.length > 1 ? "s" : ""}`;
  }, [contacts]);

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
                CRM SaaS • Contacts
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Gestion des contacts
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Centralisez vos contacts, liez-les à une entreprise et suivez leur
                statut commercial dans une interface moderne.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[360px]">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total affiché</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {contacts.length}
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
                placeholder="Rechercher un contact par nom, prénom, email, entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                {contactsCountLabel}
              </span>

              <button
                onClick={startCreate}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                + Nouveau contact
              </button>
            </div>
          </div>
        </section>

        {showForm && (
          <section className="mt-8 rounded-[2rem] border border-gray-200/70 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContactId ? "Modifier le contact" : "Ajouter un contact"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Remplissez les informations principales du contact.
                </p>
              </div>

              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {editingContactId ? "Mode édition" : "Nouveau contact"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  placeholder="Ex. Marie"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input
                  type="text"
                  placeholder="Ex. Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Ex. marie@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Téléphone
                </label>
                <input
                  type="text"
                  placeholder="Ex. 06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Entreprise
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Aucune entreprise</option>
                  {companies.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Type de contact
                </label>
                <select
                  value={contactType}
                  onChange={(e) =>
                    setContactType(
                      e.target.value as "PROSPECT" | "CLIENT" | "PARTNER"
                    )
                  }
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="PROSPECT">Prospect</option>
                  <option value="CLIENT">Client</option>
                  <option value="PARTNER">Partenaire</option>
                </select>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Notes
                </label>
                <textarea
                  placeholder="Informations complémentaires sur le contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
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
                    ? editingContactId
                      ? "Modification..."
                      : "Création..."
                    : editingContactId
                      ? "Mettre à jour"
                      : "Ajouter le contact"}
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
          ) : contacts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Aucun contact trouvé
              </h3>
              <p className="mt-2 text-gray-500">
                Ajoutez un premier contact ou modifiez votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="group rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-100 text-lg font-bold text-blue-700">
                        {getInitials(contact.first_name, contact.last_name) || "?"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {contact.company_name || "Aucune entreprise"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getContactTypeBadgeClass(
                        contact.contact_type
                      )}`}
                    >
                      {getContactTypeLabel(contact.contact_type)}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Email
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-gray-800">
                        {contact.email || "Pas d’email"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Téléphone
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {contact.phone || "Pas de téléphone"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Notes
                      </p>
                      <p className="mt-1 min-h-[48px] line-clamp-3 text-sm text-gray-700">
                        {contact.notes || "Aucune note"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startEdit(contact)}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => deleteContact(contact.id)}
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