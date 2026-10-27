
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Users,
  ShoppingCart,
  Clock3,
  X,
  CreditCard,
  Package,
  CheckCheck,
  BellRing,
  ArrowLeft,
} from "lucide-react";
import { orders } from "../data/orders";
import { customersData } from "../data/customers";

const RECENT_SEARCHES_KEY = "nexapanel-recent-searches";
const READ_NOTIFICATIONS_KEY = "nexapanel-read-notifications";
const MAX_RECENT_SEARCHES = 5;

const initialNotifications = [
  {
    id: "notification-order-1042",
    type: "order",
    title: "New order received",
    message: "Order #NX-1042 was placed by Olivia Martin.",
    time: "2 min ago",
    path: "/orders",
    searchQuery: "#NX-1042",
  },
  {
    id: "notification-payment-1041",
    type: "payment",
    title: "Payment received",
    message: "Payment of $180.50 has been recorded.",
    time: "18 min ago",
    path: "/orders",
    searchQuery: "#NX-1041",
  },
  {
    id: "notification-stock-001",
    type: "inventory",
    title: "Low stock alert",
    message: "A product is running low on inventory.",
    time: "1 hour ago",
    path: null,
    searchQuery: null,
  },
  {
    id: "notification-order-1040",
    type: "order",
    title: "Order completed",
    message: "Order #NX-1040 has been completed.",
    time: "3 hours ago",
    path: "/orders",
    searchQuery: "#NX-1040",
  },
];

function readStorageArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readRecentSearches() {
  return readStorageArray(RECENT_SEARCHES_KEY)
    .filter((item) => typeof item === "string")
    .slice(0, MAX_RECENT_SEARCHES);
}

function loadReadNotificationIds() {
  return readStorageArray(READ_NOTIFICATIONS_KEY).filter(
    (item) => typeof item === "string",
  );
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function getNotificationIcon(type) {
  if (type === "payment") return CreditCard;
  if (type === "inventory") return Package;
  return ShoppingCart;
}

export default function Header({
  isDark,
  onToggleTheme,
  title = "Dashboard",
  eyebrow = "WORKSPACE / OVERVIEW",
  description = "Here’s what’s happening with your store today.",
}) {
  const navigate = useNavigate();

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const notificationsContainerRef = useRef(null);

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] =
    useState(readRecentSearches);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] =
    useState(loadReadNotificationIds);
  const [showInventoryDetails, setShowInventoryDetails] =
    useState(false);

  const query = normalize(search);

  const unreadCount = initialNotifications.filter(
    (notification) =>
      !readNotificationIds.includes(notification.id),
  ).length;

  const results = query
    ? [
        ...orders
          .filter((order) =>
            [
              order.id,
              order.customer,
              order.email,
              order.status,
              order.date,
            ].some((value) => normalize(value).includes(query)),
          )
          .map((order) => ({
            id: `order-${order.id}`,
            type: "order",
            title: order.id,
            subtitle: `${order.customer} · ${order.email}`,
            meta: `${order.status} · ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(order.amount)}`,
            path: "/orders",
            icon: ShoppingCart,
          })),
        ...customersData
          .filter((customer) =>
            [
              customer.name,
              customer.email,
              customer.company,
              customer.status,
            ].some((value) => normalize(value).includes(query)),
          )
          .map((customer) => ({
            id: `customer-${customer.id}`,
            type: "customer",
            title: customer.name,
            subtitle: customer.email,
            meta: customer.company,
            path: "/customers",
            icon: Users,
          })),
      ].slice(0, 8)
    : [];

  function saveRecentSearch(value) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const next = [
      trimmed,
      ...recentSearches.filter(
        (item) => normalize(item) !== normalize(trimmed),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(next);

    try {
      localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Search remains usable if browser storage is unavailable.
    }
  }

  function openResult(result) {
    const queryToCarry = search.trim() || result.title;

    saveRecentSearch(queryToCarry);
    setIsSearchOpen(false);

    navigate({
      pathname: result.path,
      search: `?q=${encodeURIComponent(queryToCarry)}`,
    });
  }

  function runRecentSearch(value) {
    setSearch(value);
    setIsSearchOpen(true);
    searchInputRef.current?.focus();
  }

  function clearRecentSearches() {
    setRecentSearches([]);

    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  function persistReadIds(nextIds) {
    setReadNotificationIds(nextIds);

    try {
      localStorage.setItem(
        READ_NOTIFICATIONS_KEY,
        JSON.stringify(nextIds),
      );
    } catch {
      // Notifications remain usable if browser storage is unavailable.
    }
  }

  function markNotificationAsRead(notificationId) {
    if (readNotificationIds.includes(notificationId)) return;

    persistReadIds([...readNotificationIds, notificationId]);
  }

  function markAllNotificationsAsRead() {
    persistReadIds(
      initialNotifications.map((notification) => notification.id),
    );
  }

  function openNotification(notification) {
    markNotificationAsRead(notification.id);

    if (notification.type === "inventory") {
      setShowInventoryDetails(true);
      return;
    }

    setIsNotificationsOpen(false);

    if (notification.path) {
      navigate({
        pathname: notification.path,
        search: notification.searchQuery
          ? `?q=${encodeURIComponent(notification.searchQuery)}`
          : "",
      });
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setShowInventoryDetails(false);
        searchInputRef.current?.blur();
      }
    }

    function handleOutsideClick(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }

      if (
        notificationsContainerRef.current &&
        !notificationsContainerRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
        setShowInventoryDetails(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="header">
      <div className="header__title">
        <span className="header__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="header__actions">
        <div className="global-search" ref={searchContainerRef}>
          <label className="search-box">
            <Search size={18} />

            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search anything..."
              aria-label="Search orders and customers"
              aria-expanded={isSearchOpen}
              aria-controls="global-search-results"
              value={search}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setIsSearchOpen(true);
              }}
            />

            {search ? (
              <button
                type="button"
                className="global-search__clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setIsSearchOpen(true);
                  searchInputRef.current?.focus();
                }}
              >
                <X size={15} />
              </button>
            ) : (
              <kbd>Ctrl K</kbd>
            )}
          </label>

          {isSearchOpen && (
            <div
              className="global-search__dropdown"
              id="global-search-results"
              role="region"
              aria-label="Search results"
            >
              {query ? (
                <>
                  <div className="global-search__heading">
                    <span>Search results</span>
                    <span>{results.length} found</span>
                  </div>

                  {results.length > 0 ? (
                    <div className="global-search__list">
                      {results.map((result) => {
                        const ResultIcon = result.icon;

                        return (
                          <button
                            type="button"
                            className="global-search__result"
                            key={result.id}
                            onClick={() => openResult(result)}
                          >
                            <span className="global-search__result-icon">
                              <ResultIcon size={17} />
                            </span>

                            <span className="global-search__result-copy">
                              <strong>{result.title}</strong>
                              <span>{result.subtitle}</span>
                              <small>{result.meta}</small>
                            </span>

                            <span className="global-search__type">
                              {result.type === "order"
                                ? "Order"
                                : "Customer"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="global-search__empty">
                      <Search size={20} />
                      <strong>No results found</strong>
                      <span>
                        Try another name, email, or order ID.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="global-search__heading">
                    <span>Recent searches</span>

                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="global-search__list">
                      {recentSearches.map((item) => (
                        <button
                          type="button"
                          className="global-search__recent"
                          key={item}
                          onClick={() => runRecentSearch(item)}
                        >
                          <Clock3 size={16} />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="global-search__hint">
                      Search orders by ID, customer name, email, or
                      company.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="notifications"
          ref={notificationsContainerRef}
        >
          <button
            type="button"
            className={`icon-button notifications__trigger ${
              isNotificationsOpen ? "is-open" : ""
            }`}
            aria-label={`Notifications${
              unreadCount ? `, ${unreadCount} unread` : ""
            }`}
            aria-expanded={isNotificationsOpen}
            aria-controls="notifications-panel"
            onClick={() => {
              setIsNotificationsOpen((open) => !open);
              setIsSearchOpen(false);
              setShowInventoryDetails(false);
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                className="notification-dot"
                aria-hidden="true"
              />
            )}
          </button>

          {isNotificationsOpen && (
            <section
              className="notifications__panel"
              id="notifications-panel"
              aria-label="Notifications"
            >
              {showInventoryDetails ? (
                <div className="notifications__inventory-details">
                  <div className="notifications__header">
                    <div>
                      <h2>Low stock alert</h2>
                      <p>Inventory warning</p>
                    </div>

                    <button
                      type="button"
                      className="notifications__close"
                      aria-label="Close notifications"
                      onClick={() => {
                        setShowInventoryDetails(false);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="notifications__inventory-body">
                    <span className="notifications__item-icon notifications__item-icon--inventory">
                      <Package size={22} />
                    </span>

                    <p>
                      One or more products may need restocking. Inventory
                      data is not connected yet, so the affected product
                      cannot be identified.
                    </p>

                    <button
                      type="button"
                      className="notifications__back"
                      onClick={() => setShowInventoryDetails(false)}
                    >
                      <ArrowLeft size={15} />
                      Back to notifications
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="notifications__header">
                    <div>
                      <h2>Notifications</h2>
                      <p>
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${
                              unreadCount === 1 ? "" : "s"
                            }`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="notifications__close"
                      aria-label="Close notifications"
                      onClick={() =>
                        setIsNotificationsOpen(false)
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notifications__mark-all"
                      onClick={markAllNotificationsAsRead}
                    >
                      <CheckCheck size={16} />
                      Mark all as read
                    </button>
                  )}

                  <div className="notifications__list">
                    {initialNotifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(
                        notification.type,
                      );
                      const isRead = readNotificationIds.includes(
                        notification.id,
                      );

                      return (
                        <button
                          type="button"
                          key={notification.id}
                          className={`notifications__item ${
                            isRead ? "is-read" : "is-unread"
                          }`}
                          onClick={() =>
                            openNotification(notification)
                          }
                        >
                          <span
                            className={`notifications__item-icon notifications__item-icon--${notification.type}`}
                          >
                            <NotificationIcon size={18} />
                          </span>

                          <span className="notifications__item-content">
                            <span className="notifications__item-title">
                              {notification.title}
                              {!isRead && (
                                <span className="notifications__unread-dot" />
                              )}
                            </span>

                            <span className="notifications__item-message">
                              {notification.message}
                            </span>

                            <span className="notifications__item-time">
                              <Clock3 size={12} />
                              {notification.time}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="notifications__footer">
                    <BellRing size={15} />
                    <span>
                      You're viewing all recent notifications
                    </span>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
          title={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>

        <button type="button" className="header__date">
          Last 30 days <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
