"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api";

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user: number;
  created_at?: string;
};

function formatDate(dateString: string) {
  if (!dateString) return "Non renseignée";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);

  const [completedFilter, setCompletedFilter] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setCompleted(false);
  };

  const fetchTasks = useCallback(
    async (filterCompleted = "", initialLoad = false) => {
      try {
        setError("");

        if (initialLoad) {
          setPageLoading(true);
        } else {
          setListLoading(true);
        }

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        if (!token) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }

        const url = filterCompleted
          ? `${API_URL}/api/tasks/?completed=${encodeURIComponent(filterCompleted)}`
          : `${API_URL}/api/tasks/`;

        const res = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        });

        if (!res.ok) {
          await handleApiError(res, "Impossible de récupérer les tâches");
          return;
        }

        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des tâches";
        setError(message);
      } finally {
        setPageLoading(false);
        setListLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks("", true);
  }, [fetchTasks]);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setDueDate(task.due_date ? task.due_date.slice(0, 16) : "");
    setCompleted(task.completed);
    setShowForm(true);
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingTaskId !== null;

      const url = isEditing
        ? `${API_URL}/api/tasks/${editingTaskId}/`
        : `${API_URL}/api/tasks/`;

      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate,
        completed,
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await handleApiError(
          res,
          isEditing
            ? "Impossible de modifier la tâche"
            : "Impossible de créer la tâche"
        );
        return;
      }

      cancelForm();
      await fetchTasks(completedFilter);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : editingTaskId !== null
            ? "Erreur lors de la modification de la tâche"
            : "Erreur lors de la création de la tâche";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette tâche ?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const res = await fetch(`${API_URL}/api/tasks/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        await handleApiError(res, "Impossible de supprimer la tâche");
        return;
      }

      await fetchTasks(completedFilter);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de la tâche";
      setError(message);
    }
  };

  const tasksCountLabel = useMemo(() => {
    return `${tasks.length} tâche${tasks.length > 1 ? "s" : ""}`;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((task) => task.completed).length;
  }, [tasks]);

  const pendingCount = useMemo(() => {
    return tasks.filter((task) => !task.completed).length;
  }, [tasks]);

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
                CRM SaaS • Tâches
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Gestion des tâches
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Organisez vos suivis et gardez une vue claire sur les actions à
                mener.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[520px]">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total affiché</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {tasks.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">Terminées</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {completedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-sm text-gray-500">En attente</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {pendingCount}
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
            <div className="flex-1">
              <select
                value={completedFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setCompletedFilter(value);
                  fetchTasks(value);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Toutes les tâches</option>
                <option value="true">Terminées</option>
                <option value="false">En attente</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                {tasksCountLabel}
              </span>

              <button
                onClick={openCreateForm}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                + Nouvelle tâche
              </button>
            </div>
          </div>
        </section>

        {showForm && (
          <section className="mt-8 rounded-[2rem] border border-gray-200/70 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTaskId ? "Modifier la tâche" : "Ajouter une tâche"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Remplissez les informations principales de la tâche.
                </p>
              </div>

              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {editingTaskId ? "Mode édition" : "Nouvelle tâche"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  placeholder="Ex. Relancer le client"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Date limite
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Ex. Envoyer un email de suivi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  rows={5}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Marquer cette tâche comme terminée
                </label>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? editingTaskId
                      ? "Modification..."
                      : "Création..."
                    : editingTaskId
                      ? "Mettre à jour"
                      : "Ajouter la tâche"}
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
                  className="h-80 animate-pulse rounded-[2rem] border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Aucune tâche trouvée
              </h3>
              <p className="mt-2 text-gray-500">
                Ajoutez une première tâche.
              </p>
            </div>
          ) : (
            <>
              {listLoading && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  Chargement des tâches...
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-[2rem] border border-gray-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-gray-900">
                          {task.title}
                        </h2>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          task.completed
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {task.completed ? "Terminée" : "En attente"}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Description
                        </p>
                        <p className="mt-1 min-h-[48px] line-clamp-3 text-sm text-gray-700">
                          {task.description || "Aucune description"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Date limite
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          {formatDate(task.due_date)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Utilisateur
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          ID {task.user}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => startEdit(task)}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}