"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user: number;
  lead: number;
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [user, setUser] = useState("");
  const [lead, setLead] = useState("");

  const [completedFilter, setCompletedFilter] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async (filterCompleted = "") => {
    try {
      setError("");

      const url = filterCompleted
        ? `http://127.0.0.1:8000/api/tasks/?completed=${encodeURIComponent(filterCompleted)}`
        : "http://127.0.0.1:8000/api/tasks/";

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Impossible de récupérer les tâches");
      }

      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des tâches");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setDueDate(task.due_date ? task.due_date.slice(0, 16) : "");
    setCompleted(task.completed);
    setUser(String(task.user));
    setLead(String(task.lead));
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setCompleted(false);
    setUser("");
    setLead("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const isEditing = editingTaskId !== null;

      const url = isEditing
        ? `http://127.0.0.1:8000/api/tasks/${editingTaskId}/`
        : "http://127.0.0.1:8000/api/tasks/";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate,
          completed,
          user: Number(user),
          lead: Number(lead),
        }),
      });

      if (!res.ok) {
        throw new Error(
          isEditing
            ? "Impossible de modifier la tâche"
            : "Impossible de créer la tâche"
        );
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setCompleted(false);
      setUser("");
      setLead("");
      setEditingTaskId(null);

      await fetchTasks(completedFilter);
    } catch (err) {
      console.error(err);
      setError(
        editingTaskId !== null
          ? "Erreur lors de la modification de la tâche"
          : "Erreur lors de la création de la tâche"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setError("");

      const res = await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer la tâche");
      }

      await fetchTasks(completedFilter);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression de la tâche");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">Tâches</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <select
            value={completedFilter}
            onChange={(e) => {
              const value = e.target.value;
              setCompletedFilter(value);
              fetchTasks(value);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-800"
          >
            <option value="">Toutes les tâches</option>
            <option value="true">Terminées</option>
            <option value="false">En attente</option>
          </select>
        </div>

        <div className="mb-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            {editingTaskId ? "Modifier la tâche" : "Ajouter une tâche"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800"
              required
            />

            <input
              type="number"
              placeholder="ID utilisateur"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <input
              type="number"
              placeholder="ID lead"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-3 text-gray-800 placeholder-gray-500 md:col-span-2"
              rows={4}
            />

            <label className="flex items-center gap-2 text-gray-700 md:col-span-2">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Tâche terminée
            </label>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingTaskId
                    ? "Modification..."
                    : "Création..."
                  : editingTaskId
                  ? "Mettre à jour"
                  : "Ajouter tâche"}
              </button>

              {editingTaskId && (
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
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md"
            >
              <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>

              <p className="mt-2 text-gray-600">
                {task.description || "Aucune description"}
              </p>

              <p className="mt-2 text-gray-600">
                Date limite : {task.due_date}
              </p>

              <p className="text-gray-600">User ID : {task.user}</p>
              <p className="text-gray-600">Lead ID : {task.lead}</p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  task.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.completed ? "Terminée" : "En attente"}
              </span>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => startEdit(task)}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
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