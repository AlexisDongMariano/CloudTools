import { useEffect, useState } from "react";

import { createItem, deleteItem, getItems, getSummary, updateItem } from "./api";
import ItemForm from "./components/ItemForm";
import ItemTable from "./components/ItemTable";
import SummaryCards from "./components/SummaryCards";

export default function App() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total_items: 0,
    expired_items: 0,
    expiring_in_30_days: 0,
    expiring_in_7_days: 0,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const [itemsResponse, summaryResponse] = await Promise.all([getItems(), getSummary()]);
      setItems(itemsResponse);
      setSummary(summaryResponse);
    } catch (loadError) {
      setError(`Failed to load data: ${loadError.message}`);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
          deletingId={deletingId}
        />
      </div>
    </main>
  );
}
