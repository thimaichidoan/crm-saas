"use client";

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600"
    >
      Déconnexion
    </button>
  );
}