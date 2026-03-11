"use client";

import { useEffect, useState } from "react";

type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
  company: number | null;
  created_at: string;
};

export default function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContacts = async (searchValue = "") => {
    try {
      setError("");

      const url = searchValue
        ? `http://127.0.0.1:8000/api/contacts/?search=${encodeURIComponent(searchValue)}`
        : "http://127.0.0.1:8000/api/contacts/";

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les contacts");
      }

      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError("Erreur lors du chargement des contacts");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const startEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setFirstName(contact.first_name);
    setLastName(contact.last_name);
    setEmail(contact.email);
    setPhone(contact.phone || "");
    setNotes(contact.notes || "");
  };

  const cancelEdit = () => {
    setEditingContactId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingContactId !== null;

      const url = isEditing
        ? `http://127.0.0.1:8000/api/contacts/${editingContactId}/`
        : "http://127.0.0.1:8000/api/contacts/";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          notes: notes,
          company: null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? "Impossible de modifier le contact"
            : "Impossible de créer le contact"
        );
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setEditingContactId(null);

      await fetchContacts(search);
    } catch (err) {
      setError(
        editingContactId !== null
          ? "Erreur lors de la modification du contact"
          : "Erreur lors de la création du contact"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: number) => {
    try {
      setError("");

      const response = await fetch(`http://127.0.0.1:8000/api/contacts/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer le contact");
      }

      await fetchContacts(search);
    } catch (err) {
      setError("Erreur lors de la suppression du contact");
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">Contacts</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              fetchContacts(value);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
          />
        </div>

        <div className="mb-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            {editingContactId ? "Modifier le contact" : "Ajouter un contact"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="text"
              placeholder="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
            />

            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500 md:col-span-2"
              rows={4}
            />

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingContactId
                    ? "Modification..."
                    : "Création..."
                  : editingContactId
                  ? "Mettre à jour"
                  : "Ajouter le contact"}
              </button>

              {editingContactId && (
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
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {contact.first_name} {contact.last_name}
              </h3>

              <p className="mt-2 text-gray-600">{contact.email}</p>
              <p className="text-gray-600">
                {contact.phone || "Pas de téléphone"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {contact.notes || "Aucune note"}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => startEdit(contact)}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteContact(contact.id)}
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