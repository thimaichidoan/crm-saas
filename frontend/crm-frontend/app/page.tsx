import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-gray-800">
          CRM SaaS
        </h1>

        <p className="mt-4 text-gray-600 text-lg">
          Frontend Next.js connecté au backend Django REST API
        </p>

        <div className="mt-10 flex gap-4">

          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            Dashboard
          </a>

          <a
            href="/contacts"
            className="px-6 py-3 bg-gray-800 text-white rounded-xl"
          >
            Contacts
          </a>

        </div>

      </div>
    </main>
  );
}
