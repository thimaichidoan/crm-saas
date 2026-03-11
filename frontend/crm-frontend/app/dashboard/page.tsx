async function getStats() {
  const res = await fetch("http://127.0.0.1:8000/api/stats/", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Impossible de récupérer les statistiques");
  }

  return res.json();
}

function StatCard({
  title,
  value,
  valueColor = "text-gray-800",
}: {
  title: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <main>
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">Dashboard CRM</h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Contacts" value={stats.total_contacts} />
          <StatCard title="Entreprises" value={stats.total_companies} />
          <StatCard title="Leads" value={stats.total_leads} />
          <StatCard title="Conversion %" value={stats.conversion_rate} valueColor="text-green-600" />
          <StatCard title="Tâches en attente" value={stats.pending_tasks} valueColor="text-yellow-600" />
          <StatCard title="Tâches terminées" value={stats.completed_tasks} valueColor="text-green-600" />
        </div>
      </div>
    </main>
  );
}