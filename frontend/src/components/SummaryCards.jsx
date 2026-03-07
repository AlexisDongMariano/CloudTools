function SummaryCard({ label, value, colorClass }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colorClass}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard label="Total Items" value={summary.total_items} colorClass="bg-white" />
      <SummaryCard label="Expired" value={summary.expired_items} colorClass="bg-red-50" />
      <SummaryCard
        label="Expiring in 7 Days"
        value={summary.expiring_in_7_days}
        colorClass="bg-amber-50"
      />
      <SummaryCard
        label="Expiring in 14 Days"
        value={summary.expiring_in_14_days}
        colorClass="bg-orange-50"
      />
      <SummaryCard
        label="Expiring in 30 Days"
        value={summary.expiring_in_30_days}
        colorClass="bg-blue-50"
      />
    </section>
  );
}
