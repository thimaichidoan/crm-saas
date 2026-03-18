import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api";

export async function sendEmail(data: {
  to: string;
  subject: string;
  message: string;
}) {
  const res = await fetch(`${API_URL}/api/emailing/send-email/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await handleApiError(res, "Impossible d’envoyer l’email");
  }

  return await res.json();
}