import { Fragment } from "react";

function getDaysLeft(dateExpiration) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const today = new Date();
  const expirationDate = new Date(dateExpiration);
  const difference = expirationDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.floor(difference / oneDayInMs);
}

function getStatusLabel(daysLeft, isDeleted) {
  if (isDeleted) return "Deleted";
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= 14) return "Reminder";
  if (daysLeft <= 30) return "Upcoming";
  return "Healthy";
}

function statusClassName(daysLeft, isDeleted) {
  if (isDeleted) return "bg-slate-200 text-slate-700";
  if (daysLeft < 0) return "bg-red-100 text-red-700";
  if (daysLeft <= 14) return "bg-orange-100 text-orange-700";
  if (daysLeft <= 30) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function ItemTable({
  items,
  onEdit,
  onDelete,
  onRestore,
  onViewHistory,
  deletingId,
  restoringId,
  loadingHistoryId,
  historyByItem,
}) {
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
              <th className="p-2">Owner Email</th>
              <th className="p-2">Expires</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const daysLeft = getDaysLeft(item.date_expiration);
              const isDeleted = Boolean(item.deleted_at);
              const status = getStatusLabel(daysLeft, isDeleted);
              const rowClass = isDeleted ? "border-b bg-slate-50 text-slate-500" : "border-b";
              const historyRows = historyByItem[item.id] || [];

              return (
                <Fragment key={item.id}>
                  <tr className={rowClass}>
                    <td className="p-2">{item.item_type}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.identifier || "-"}</td>
                    <td className="p-2">{item.source}</td>
                    <td className="p-2">{item.owner}</td>
                    <td className="p-2">{item.owner_email || "-"}</td>
                    <td className="p-2">{item.date_expiration}</td>
                    <td className="p-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClassName(daysLeft, isDeleted)}`}
                      >
                        {status}
                        {!isDeleted && ` (${daysLeft}d)`}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded border px-2 py-1 text-slate-700 disabled:opacity-50"
                          onClick={() => onEdit(item)}
                          disabled={isDeleted}
                        >
                          Edit
                        </button>
                        {!isDeleted ? (
                          <button
                            className="rounded bg-red-600 px-2 py-1 text-white disabled:opacity-50"
                            onClick={() => onDelete(item.id)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? "Deleting..." : "Soft Delete"}
                          </button>
                        ) : (
                          <button
                            className="rounded bg-emerald-600 px-2 py-1 text-white disabled:opacity-50"
                            onClick={() => onRestore(item.id)}
                            disabled={restoringId === item.id}
                          >
                            {restoringId === item.id ? "Restoring..." : "Restore"}
                          </button>
                        )}
                        <button
                          className="rounded border px-2 py-1 text-slate-700 disabled:opacity-50"
                          onClick={() => onViewHistory(item.id)}
                          disabled={loadingHistoryId === item.id}
                        >
                          {loadingHistoryId === item.id ? "Loading..." : "History"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {historyRows.length > 0 && (
                    <tr className="border-b bg-slate-50">
                      <td className="p-2" colSpan={9}>
                        <p className="mb-2 text-xs font-semibold text-slate-700">History</p>
                        <div className="space-y-1 text-xs text-slate-600">
                          {historyRows.map((historyRow) => (
                            <p key={historyRow.id}>
                              {historyRow.changed_at}: <strong>{historyRow.action}</strong>
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
