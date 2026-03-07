import { useState } from "react";

const defaultFormValues = {
  item_type: "tls_certificate",
  name: "",
  identifier: "",
  source: "",
  owner: "",
  owner_email: "",
  ticket: "",
  environment: "production",
  date_created: "",
  date_expiration: "",
  notes: "",
  is_active: true,
};

const itemTypes = [
  "tls_certificate",
  "api_key",
  "oauth_client_secret",
  "service_principal_secret",
  "iam_access_key",
  "domain_registration",
  "license_renewal",
  "ssh_key",
  "saml_signing_certificate",
];

function buildFormValues(editingItem) {
  if (!editingItem) {
    return { ...defaultFormValues };
  }

  return {
    ...defaultFormValues,
    ...editingItem,
    identifier: editingItem.identifier || "",
    owner_email: editingItem.owner_email || "",
    ticket: editingItem.ticket || "",
    environment: editingItem.environment || "",
    notes: editingItem.notes || "",
  };
}

export default function ItemForm({ editingItem, onSave, onCancelEdit, saving }) {
  const [formValues, setFormValues] = useState(() => buildFormValues(editingItem));

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...formValues,
      identifier: formValues.identifier || null,
      owner_email: formValues.owner_email || null,
      ticket: formValues.ticket || null,
      environment: formValues.environment || null,
      notes: formValues.notes || null,
    };

    onSave(payload);
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{editingItem ? "Edit Item" : "Add New Item"}</h2>
      <p className="mt-1 text-sm text-slate-600">
        Track metadata only (never store actual secrets).
      </p>

      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="item_type"
            value={formValues.item_type}
            onChange={handleChange}
            required
          >
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Unique Identifier (optional)</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="identifier"
            placeholder="Thumbprint, access key name, key id"
            value={formValues.identifier}
            onChange={handleChange}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Source</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="source"
            placeholder="Azure, Confluence, Freshdesk, AWS IAM"
            value={formValues.source}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Owner</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="owner"
            value={formValues.owner}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Owner Email / Group Email (optional)</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="owner_email"
            placeholder="team-cloudops@company.com"
            value={formValues.owner_email}
            onChange={handleChange}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Ticket (optional)</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="ticket"
            placeholder="INC123, CHG456, JIRA-789"
            value={formValues.ticket}
            onChange={handleChange}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Date Created</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="date"
            name="date_created"
            value={formValues.date_created}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Date Expiration</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="date"
            name="date_expiration"
            value={formValues.date_expiration}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Environment (optional)</span>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            name="environment"
            placeholder="production, staging, dev"
            value={formValues.environment}
            onChange={handleChange}
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium">Notes (optional)</span>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={3}
            name="notes"
            value={formValues.notes}
            onChange={handleChange}
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formValues.is_active}
            onChange={handleChange}
          />
          <span className="text-sm">Active item</span>
        </label>

        <div className="flex gap-2 md:col-span-2">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
          </button>
          {editingItem && (
            <button
              className="rounded-md border px-4 py-2 text-slate-700"
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

    </section>
  );
}
