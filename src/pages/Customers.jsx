
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  confirmDelete,
  showSuccess,
  showError,
} from "../utils/alerts";

import {
  useCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../data/customers";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const emptyForm = {
  name: "",
  email: "",
  company: "",
  status: "Active",
};

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customers = useCustomers();

  // Search is derived from the URL, keeping browser navigation in sync.
  const searchTerm = searchParams.get("q") ?? "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  function handleSearchChange(value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
  }

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.company,
        customer.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      ),
    );
  }, [customers, searchTerm]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingId(customer.id);

    setForm({
      name: customer.name,
      email: customer.email,
      company: customer.company,
      status: customer.status,
    });

    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const company = form.company.trim();

    if (!name || !email || !company) {
      setFormError("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const duplicateEmail = customers.some(
      (customer) =>
        customer.email.toLowerCase() === email.toLowerCase() &&
        customer.id !== editingId,
    );

    if (duplicateEmail) {
      setFormError("A customer with this email already exists.");
      return;
    }

    const customerData = {
      name,
      email,
      company,
      status: form.status,
    };

    if (editingId !== null) {
      updateCustomer(editingId, customerData);
    } else {
      addCustomer(customerData);
    }

    closeModal();
  }

  async function handleDelete(customer) {
    const result = await confirmDelete({
      title: "Delete customer?",
      text: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const deleted = deleteCustomer(customer.id);

    if (!deleted) {
      await showError({
        title: "Unable to delete",
        text: "This customer could not be found. Please refresh the page and try again.",
        confirmText: "OK",
      });

      return;
    }

    await showSuccess({
      title: "Customer deleted",
      text: `${customer.name} was deleted successfully.`,
      confirmText: "Done",
    });
  }

  return (
    <section className="page-content customers-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">CUSTOMER MANAGEMENT</p>
          <h2>Customers</h2>
          <p className="page-description">
            Manage your customers and keep track of their activity.
          </p>
        </div>

        <button
          type="button"
          className="primary-action-button"
          onClick={openAddModal}
        >
          <UserPlus size={17} />
          <span>Add customer</span>
        </button>
      </div>

      <div className="customer-summary-grid">
        <article className="customer-summary-card">
          <div className="customer-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <p>Total customers</p>
            <strong>{customers.length}</strong>
          </div>
        </article>

        <article className="customer-summary-card">
          <div className="customer-summary-icon customer-summary-icon--green">
            <Users size={20} />
          </div>

          <div>
            <p>Active customers</p>
            <strong>{activeCustomers}</strong>
          </div>
        </article>
      </div>

      <div className="customers-table-card">
        <div className="customers-table-toolbar">
          <div>
            <h3>All customers</h3>
            <p>{filteredCustomers.length} customers found</p>
          </div>

          <label className="customers-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              aria-label="Search customers"
            />
          </label>
        </div>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-identity">
                      <div className="customer-avatar">
                        {customer.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="customer-identity-info">
                        <strong>{customer.name}</strong>
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{customer.company}</td>
                  <td>{customer.orders}</td>
                  <td>{currencyFormatter.format(customer.spent)}</td>

                  <td>
                    <span
                      className={`customer-status ${
                        customer.status === "Active"
                          ? "customer-status--active"
                          : "customer-status--inactive"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td>
                    <div className="customer-row-actions">
                      <button
                        type="button"
                        className="customer-icon-button"
                        onClick={() => openEditModal(customer)}
                        aria-label={`Edit ${customer.name}`}
                        title="Edit customer"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="customer-icon-button customer-icon-button--danger"
                        onClick={() => handleDelete(customer)}
                        aria-label={`Delete ${customer.name}`}
                        title="Delete customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="customers-empty">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="customer-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
          >
            <div className="customer-modal-header">
              <div>
                <p className="page-eyebrow">
                  CUSTOMER MANAGEMENT
                </p>

                <h3 id="customer-modal-title">
                  {editingId !== null
                    ? "Edit customer"
                    : "Add customer"}
                </h3>
              </div>

              <button
                type="button"
                className="customer-icon-button"
                onClick={closeModal}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="customer-form-grid">
                <label className="customer-form-field">
                  <span>Full name *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Olivia Martin"
                    autoFocus
                    required
                    maxLength={100}
                  />
                </label>

                <label className="customer-form-field">
                  <span>Email address *</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="name@example.com"
                    required
                    maxLength={254}
                  />
                </label>

                <label className="customer-form-field">
                  <span>Company *</span>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleFormChange}
                    placeholder="Company name"
                    required
                    maxLength={120}
                  />
                </label>

                <label className="customer-form-field">
                  <span>Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {formError && (
                <p className="customer-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="customer-modal-footer">
                <button
                  type="button"
                  className="customer-secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-button"
                >
                  {editingId !== null
                    ? "Save changes"
                    : "Add customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
