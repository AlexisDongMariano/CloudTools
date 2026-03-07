function getDaysLeft(dateExpiration) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const today = new Date();
  const expirationDate = new Date(dateExpiration);
  const difference = expirationDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.floor(difference / oneDayInMs);
}

function getStatusLabel(daysLeft) {
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= 7) return "Critical";
  if (daysLeft <= 30) return "Soon";
  return "Healthy";
}

function statusClassName(daysLeft) {
  if (daysLeft < 0) return "bg-red-100 text-red-700";
  if (daysLeft <= 7) return "bg-orange-100 text-orange-700";
  if (daysLeft <= 30) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function ItemTable({ items, onEdit, onDelete, deletingId }) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-slate-600">No items yet. Add your first tracked item above.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Tracked Items</h2>
      <p className="mt-1 text-sm text-slate-600">
        This table tracks expiry metadata only. Secret values are never stored.
      </p>

      <div className="mt-4 overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Type</th>
              <th className="p-2">Name</th>
              <th className="p-2">Identifier</th>
              <th className="p-2">Source</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Expires</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const daysLeft = getDaysLeft(item.date_expiration);
              const status = getStatusLabel(daysLeft);
              return (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.item_type}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.identifier || "-"}</td>
                  <td className="p-2">{item.source}</td>
                  <td className="p-2">{item.owner}</td>
                  <td className="p-2">{item.date_expiration}</td>
                  <td className="p-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClassName(daysLeft)}`}>
                      {status} ({daysLeft}d)
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-2 py-1 text-slate-700"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded bg-red-600 px-2 py-1 text-white disabled:opacity-50"
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
