
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useOrders } from "../data/orders";

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

export default function OrderDetails() {
  const { orderId } = useParams();
  const orders = useOrders();

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <section className="order-details-page">
        <Link to="/orders" className="order-details-back">
          <ArrowLeft size={17} />
          Back to orders
        </Link>

        <div className="order-details-empty">
          <Package size={36} />
          <h2>Order not found</h2>
          <p>
            This order may have been deleted or may no longer exist.
          </p>
          <Link to="/orders" className="orders-add-button">
            View all orders
          </Link>
        </div>
      </section>
    );
  }

  const statusClass = String(order.status)
    .toLowerCase()
    .replace(/\s+/g, "-");

  const details = [
    {
      label: "Order ID",
      value: order.id,
      icon: Package,
    },
    {
      label: "Order date",
      value: order.date || "Not provided",
      icon: CalendarDays,
    },
    {
      label: "Customer",
      value: order.customer || "Not provided",
      icon: UserRound,
    },
    {
      label: "Email address",
      value: order.email || "Not provided",
      icon: Mail,
    },
  ];

  return (
    <section className="order-details-page">
      <Link to="/orders" className="order-details-back">
        <ArrowLeft size={17} />
        Back to orders
      </Link>

      <div className="order-details-heading">
        <div>
          <span className="order-details-eyebrow">
            ORDER MANAGEMENT
          </span>
          <h2>Order details</h2>
          <p>Review the information for {order.id}.</p>
        </div>

        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {order.status}
        </span>
      </div>

      <div className="order-details-grid">
        <article className="order-details-card">
          <div className="order-details-card__heading">
            <ShoppingBag size={19} />
            <h3>Order information</h3>
          </div>

          <div className="order-details-list">
            {details.map(({ label, value, icon: Icon }) => (
              <div className="order-details-item" key={label}>
                <span className="order-details-item__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <span className="order-details-label">{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="order-details-card">
          <div className="order-details-card__heading">
            <CreditCard size={19} />
            <h3>Payment summary</h3>
          </div>

          <div className="order-details-total">
            <span>Total order amount</span>
            <strong>{currency.format(Number(order.amount) || 0)}</strong>
          </div>

          <div className="order-details-payment-row">
            <span>Order status</span>
            <span className={`status-badge ${statusClass}`}>
              <span className="status-dot" />
              {order.status}
            </span>
          </div>

          <div className="order-details-payment-row">
            <span>Customer initials</span>
            <strong>{order.initials || getInitials(order.customer)}</strong>
          </div>

          <p className="order-details-note">
            Payment method and transaction details are not available
            in the current order data.
          </p>
        </article>
      </div>
    </section>
  );
}
