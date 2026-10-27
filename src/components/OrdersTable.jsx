
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";

import {
  confirmDelete,
  showSuccess,
  showError,
} from "../utils/alerts";

import {
  useOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} from "../data/orders";

const filters = [
  "All orders",
  "Completed",
  "Processing",
  "Pending",
  "Cancelled",
];

const statuses = [
  "Completed",
  "Processing",
  "Pending",
  "Cancelled",
];

const avatarColors = ["lavender", "blue", "peach", "mint", "pink"];
const pageSizes = [10, 20, 50];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getTodayDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function getNextOrderId(orders) {
  const maxNumber = orders.reduce((max, order) => {
    const match = String(order.id).match(/NX-(\d+)/i);

    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `#NX-${maxNumber + 1}`;
}

const emptyForm = {
  customer: "",
  email: "",
  date: getTodayDate(),
  amount: "",
  status: "Pending",
};

export default function OrdersTable() {
  const orders = useOrders();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search is derived from the URL, so browser navigation stays in sync.
  const search = searchParams.get("q") ?? "";

  const [statusFilter, setStatusFilter] = useState("All orders");
  const [pageSize, setPageSize] = useState(10);

  // Store the page together with its search/filter criteria.
  // When the criteria change, the effective page automatically becomes 1.
  const [pageState, setPageState] = useState({
    criteriaKey: "",
    page: 1,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Immediate lock prevents duplicate submissions before React re-renders.
  const isSavingRef = useRef(false);

  function handleSearchChange(value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const searchableValues = [
        order.customer,
        order.email,
        order.id,
        order.status,
        order.date,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "All orders" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const paginationKey = JSON.stringify([
    search,
    statusFilter,
    pageSize,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize),
  );

  const currentPage =
    pageState.criteriaKey === paginationKey
      ? pageState.page
      : 1;

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  const visibleOrders = useMemo(
    () => filteredOrders.slice(startIndex, startIndex + pageSize),
    [filteredOrders, startIndex, pageSize],
  );

  const firstVisibleOrder =
    filteredOrders.length === 0 ? 0 : startIndex + 1;

  const lastVisibleOrder = Math.min(
    startIndex + pageSize,
    filteredOrders.length,
  );

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm, date: getTodayDate() });
    setFormError("");
    isSavingRef.current = false;
    setIsSaving(false);
    setIsFormOpen(true);
  }

  function openEditForm(order) {
    setEditingId(order.id);

    setForm({
      customer: order.customer ?? "",
      email: order.email ?? "",
      date: order.date ?? getTodayDate(),
      amount: String(order.amount ?? ""),
      status: order.status ?? "Pending",
    });

    setFormError("");
    isSavingRef.current = false;
    setIsSaving(false);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm, date: getTodayDate() });
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

    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    setFormError("");

    try {
      const customer = form.customer.trim();
      const email = form.email.trim();
      const date = form.date.trim();
      const amount = Number(form.amount);

      if (!customer || !email || !date || form.amount === "") {
        setFormError("Please complete all fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError("Enter a valid email address.");
        return;
      }

      if (!Number.isFinite(amount) || amount < 0) {
        setFormError("Enter a valid, non-negative amount.");
        return;
      }

      if (!statuses.includes(form.status)) {
        setFormError("Select a valid order status.");
        return;
      }

      const existingOrder = editingId
        ? orders.find((order) => order.id === editingId)
        : null;

      if (editingId && !existingOrder) {
        setFormError(
          "This order could not be found. Please refresh the page and try again.",
        );
        return;
      }

      const orderData = {
        customer,
        email,
        date,
        amount,
        status: form.status,
        initials: getInitials(customer),
        color:
          existingOrder?.color ??
          avatarColors[orders.length % avatarColors.length],
      };

      if (editingId) {
        updateOrder(editingId, orderData);
      } else {
        addOrder({
          id: getNextOrderId(orders),
          ...orderData,
        });
      }

      closeForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save this order.",
      );
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleDelete(order) {
    const result = await confirmDelete({
      title: "Delete order?",
      text: `Are you sure you want to delete order ${order.id} for ${order.customer}? This action cannot be undone.`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const deleted = deleteOrder(order.id);

      if (!deleted) {
        await showError({
          title: "Unable to delete",
          text: "This order could not be found. Please refresh the page and try again.",
          confirmText: "OK",
        });
        return;
      }

      await showSuccess({
        title: "Order deleted",
        text: `Order ${order.id} was deleted successfully.`,
        confirmText: "Done",
      });
    } catch (error) {
      await showError({
        title: "Unable to delete",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting this order.",
        confirmText: "OK",
      });
    }
  }

  function openOrderDetails(order) {
    navigate(`/orders/${encodeURIComponent(String(order.id))}`);
  }

  function handleRowKeyDown(event, order) {
    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== event.currentTarget) return;

      event.preventDefault();
      openOrderDetails(order);
    }
  }

  return (
    <section className="orders-section">
      <div className="orders-toolbar">
        <div className="section-heading">
          <div>
            <h2>Orders</h2>
            <p>Manage and track your customer orders.</p>
          </div>

          <span className="orders-count">
            {filteredOrders.length} orders
          </span>
        </div>

        <div className="orders-controls">
          <label className="orders-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search orders or customers..."
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              aria-label="Search orders or customers"
            />
          </label>

          <label className="orders-filter">
            <SlidersHorizontal size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter orders by status"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </label>

          <button
            type="button"
            className="orders-add-button"
            onClick={openCreateForm}
          >
            <Plus size={17} />
            Add order
          </button>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {visibleOrders.map((order) => (
              <tr
                key={order.id}
                className="orders-table-row"
                tabIndex={0}
                onClick={(event) => {
                  if (
                    event.target.closest(
                      "a, button, input, select",
                    )
                  ) {
                    return;
                  }

                  openOrderDetails(order);
                }}
                onKeyDown={(event) =>
                  handleRowKeyDown(event, order)
                }
              >
                <td>
                  <Link
                    to={`/orders/${encodeURIComponent(
                      String(order.id),
                    )}`}
                    className="order-id order-id-link"
                    aria-label={`View details for ${order.id}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {order.id}
                  </Link>
                </td>

                <td>
                  <div className="customer-cell">
                    <div
                      className={`customer-avatar ${
                        order.color || "blue"
                      }`}
                    >
                      {order.initials ||
                        getInitials(order.customer)}
                    </div>

                    <div className="customer-info">
                      <strong>{order.customer}</strong>
                      <span>{order.email}</span>
                    </div>
                  </div>
                </td>

                <td className="order-date">{order.date}</td>

                <td className="order-amount">
                  {currency.format(Number(order.amount) || 0)}
                </td>

                <td>
                  <span
                    className={`status-badge ${String(
                      order.status,
                    ).toLowerCase()}`}
                  >
                    <span className="status-dot" />
                    {order.status}
                  </span>
                </td>

                <td>
                  <div className="orders-row-actions">
                    <button
                      type="button"
                      className="orders-action-button"
                      aria-label={`Edit ${order.id}`}
                      title="Edit order"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditForm(order);
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="orders-action-button orders-action-button--delete"
                      aria-label={`Delete ${order.id}`}
                      title="Delete order"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(order);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="orders-empty">
                  <ShoppingCart size={24} />
                  <span>
                    No orders found. Try another search or filter.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="orders-pagination">
        <div className="orders-pagination__info">
          <label htmlFor="orders-page-size">
            Rows per page
          </label>

          <select
            id="orders-page-size"
            value={pageSize}
            onChange={(event) =>
              setPageSize(Number(event.target.value))
            }
            aria-label="Rows per page"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <span>
            {firstVisibleOrder}–{lastVisibleOrder} of{" "}
            {filteredOrders.length}
          </span>
        </div>

        <div className="orders-pagination__actions">
          <button
            type="button"
            className="orders-page-button"
            disabled={safePage <= 1}
            onClick={() =>
              setPageState({
                criteriaKey: paginationKey,
                page: Math.max(1, safePage - 1),
              })
            }
            aria-label="Previous page"
          >
            Previous
          </button>

          <span className="orders-page-indicator">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            className="orders-page-button"
            disabled={safePage >= totalPages}
            onClick={() =>
              setPageState({
                criteriaKey: paginationKey,
                page: Math.min(totalPages, safePage + 1),
              })
            }
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      <div className="orders-footer">
        <span>
          Showing {firstVisibleOrder}–{lastVisibleOrder} of{" "}
          {orders.length} total orders
        </span>

        <span className="orders-footer__note">
          Changes are saved in this browser
        </span>
      </div>

      {isFormOpen && (
        <div
          className="orders-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orders-modal-title"
          >
            <div className="orders-modal__header">
              <div>
                <h2 id="orders-modal-title">
                  {editingId ? "Edit order" : "Add new order"}
                </h2>

                <p>
                  {editingId
                    ? `Update ${editingId}`
                    : "Enter the customer and order details."}
                </p>
              </div>

              <button
                type="button"
                className="orders-action-button"
                aria-label="Close form"
                onClick={closeForm}
                disabled={isSaving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="orders-form"
              onSubmit={handleSubmit}
            >
              <label>
                Customer name
                <input
                  name="customer"
                  value={form.customer}
                  onChange={handleFormChange}
                  placeholder="e.g. Olivia Martin"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="customer@example.com"
                  maxLength={254}
                  required
                />
              </label>

              <div className="orders-form__row">
                <label>
                  Order date
                  <input
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    placeholder="Oct 27, 2026"
                    maxLength={40}
                    required
                  />
                </label>

                <label>
                  Amount (USD)
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>

              <label>
                Order status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              {formError && (
                <p
                  className="orders-form__error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="orders-form__actions">
                <button
                  type="button"
                  className="orders-cancel-button"
                  onClick={closeForm}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="orders-add-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create order"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
