import { useCallback, useEffect, useState } from "react";

import {
  createItem,
  deleteItem,
  getItemHistory,
  getItems,
  getSummary,
  restoreItem,
  updateItem,
} from "./api";
import ItemForm from "./components/ItemForm";
import ItemTable from "./components/ItemTable";
import SummaryCards from "./components/SummaryCards";

function getDaysLeft(dateExpiration) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const today = new Date();
  const expirationDate = new Date(dateExpiration);
  const difference = expirationDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.floor(difference / oneDayInMs);
}

export default function App() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total_items: 0,
    expired_items: 0,
    expiring_in_14_days: 0,
    expiring_in_30_days: 0,
    expiring_in_7_days: 0,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [historyByItem, setHistoryByItem] = useState({});
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [itemsResponse, summaryResponse] = await Promise.all([getItems(showDeleted), getSummary()]);
      setItems(itemsResponse);
      setSummary(summaryResponse);
    } catch (loadError) {
      setError(`Failed to load data: ${loadError.message}`);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave(formPayload) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingItem) {
        await updateItem(editingItem.id, formPayload);
        setMessage("Item updated successfully.");
      } else {
        await createItem(formPayload);
        setMessage("Item created successfully.");
      }

      setEditingItem(null);
      await loadData();
    } catch (saveError) {
      setError(`Failed to save item: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId) {
    if (!window.confirm("Delete this item?")) {
      return;
    }

    try {
      setDeletingId(itemId);
      setError("");
      setMessage("");
      await deleteItem(itemId);
      setMessage("Item deleted successfully.");
      await loadData();
    } catch (deleteError) {
      setError(`Failed to delete item: ${deleteError.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(itemId) {
    try {
      setRestoringId(itemId);
      setError("");
      setMessage("");
      await restoreItem(itemId);
      setMessage("Item restored successfully.");
      await loadData();
    } catch (restoreError) {
      setError(`Failed to restore item: ${restoreError.message}`);
    } finally {
      setRestoringId(null);
    }
  }

  async function handleViewHistory(itemId) {
    if (historyByItem[itemId]) {
      setHistoryByItem((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }

    try {
      setLoadingHistoryId(itemId);
      const historyRows = await getItemHistory(itemId);
      setHistoryByItem((prev) => ({ ...prev, [itemId]: historyRows }));
    } catch (historyError) {
      setError(`Failed to load item history: ${historyError.message}`);
    } finally {
      setLoadingHistoryId(null);
    }
  }

  const reminderItems = items
    .filter((item) => {
      if (item.deleted_at || !item.is_active) {
        return false;
      }
      const daysLeft = getDaysLeft(item.date_expiration);
      return daysLeft >= 0 && daysLeft <= 14;
    })
    .sort((a, b) => a.date_expiration.localeCompare(b.date_expiration));

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold">CloudTools</h1>
          <p className="mt-2 text-slate-700">
            Expiration Tracker for certificates, API keys, and other time-limited cloud items.
          </p>
        </header>

        {message && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <SummaryCards summary={summary} />

        <section className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="text-lg font-semibold text-orange-900">14-Day Reminder Notifications</h2>
          {reminderItems.length === 0 ? (
            <p className="mt-1 text-sm text-orange-800">No items are currently in the 14-day window.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-orange-900">
              {reminderItems.map((item) => (
                <li key={item.id}>
                  {item.item_type} - <strong>{item.name}</strong> expires on {item.date_expiration}
                  {item.owner_email ? ` (notify: ${item.owner_email})` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(event) => setShowDeleted(event.target.checked)}
          />
          Show soft-deleted items
        </label>

        <ItemForm
          key={editingItem ? `edit-${editingItem.id}` : "new"}
          editingItem={editingItem}
          onSave={handleSave}
          onCancelEdit={() => setEditingItem(null)}
          saving={saving}
        />

        <ItemTable
          items={items}
          onEdit={(item) => setEditingItem(item)}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onViewHistory={handleViewHistory}
          deletingId={deletingId}
          restoringId={restoringId}
          loadingHistoryId={loadingHistoryId}
          historyByItem={historyByItem}
        />
      </div>
    </main>
  );
}
