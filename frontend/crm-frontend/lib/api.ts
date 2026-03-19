// lib/api.ts

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://crm-saas-4bmp.onrender.com";

export function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }

  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function handleApiError(
  response: Response,
  defaultMessage: string
) {
  let errorMessage = defaultMessage;

  try {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (data?.detail) {
        errorMessage = data.detail;
      }
    } else {
      const text = await response.text();
      console.error("API error:", response.status, text);
    }
  } catch (error) {
    console.error("Erreur lecture réponse API :", error);
  }

  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw new Error("Session expirée, veuillez vous reconnecter.");
  }

  throw new Error(`${errorMessage} (${response.status})`);
}

async function parseJsonResponse(res: Response) {
  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Réponse non JSON :", text);
    throw new Error("Le serveur a renvoyé du HTML au lieu de JSON.");
  }

  return res.json();
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  defaultErrorMessage = "Erreur API"
) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    await handleApiError(res, defaultErrorMessage);
  }

  return parseJsonResponse(res);
}

/* =========================
   CONTACTS
========================= */

export async function fetchContacts() {
  return apiRequest(
    "/api/contacts/",
    {
      method: "GET",
    },
    "Impossible de récupérer les contacts"
  );
}

export async function createContact(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  company?: number | null;
}) {
  return apiRequest(
    "/api/contacts/",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    "Impossible de créer le contact"
  );
}

export async function updateContact(
  id: number,
  data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company: number | null;
  }>
) {
  return apiRequest(
    `/api/contacts/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    "Impossible de modifier le contact"
  );
}

export async function deleteContact(id: number) {
  await apiRequest(
    `/api/contacts/${id}/`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le contact"
  );

  return true;
}

/* =========================
   DEALS
========================= */

export async function fetchDeals() {
  return apiRequest(
    "/api/deals/",
    {
      method: "GET",
    },
    "Impossible de récupérer les deals"
  );
}

export async function createDeal(data: {
  title: string;
  description: string | null;
  value: number;
  stage: string;
  contact: number | null;
  company: number | null;
  expected_close_date: string | null;
  is_active: boolean;
}) {
  return apiRequest(
    "/api/deals/",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    "Impossible de créer le deal"
  );
}

export async function updateDeal(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    value: number;
    stage: string;
    contact: number | null;
    company: number | null;
    expected_close_date: string | null;
    is_active: boolean;
  }>
) {
  return apiRequest(
    `/api/deals/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    "Impossible de modifier le deal"
  );
}

export async function deleteDeal(id: number) {
  await apiRequest(
    `/api/deals/${id}/`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le deal"
  );

  return true;
}