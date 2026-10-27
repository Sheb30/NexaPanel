
import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import "./App.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersTable = lazy(() => import("./components/OrdersTable"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Customers = lazy(() => import("./pages/Customers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));

const pageMetadata = {
  "/": {
    title: "Dashboard",
    eyebrow: "WORKSPACE / OVERVIEW",
    description: "Here’s what’s happening with your store today.",
  },
  "/orders": {
    title: "Orders",
    eyebrow: "WORKSPACE / ORDERS",
    description: "Track and manage your latest orders.",
  },
  "/customers": {
    title: "Customers",
    eyebrow: "WORKSPACE / CUSTOMERS",
    description: "Manage your customers and monitor their activity.",
  },
  "/analytics": {
    title: "Analytics",
    eyebrow: "WORKSPACE / ANALYTICS",
    description: "Explore your business performance and trends.",
  },
  "/settings": {
    title: "Settings",
    eyebrow: "WORKSPACE / SETTINGS",
    description: "Customize your account and workspace preferences.",
  },
};

function PageLoading() {
  return (
    <div
      className="page-loading"
      role="status"
      aria-live="polite"
    >
      Loading page...
    </div>
  );
}

function AppLayout() {
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("nexapanel-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("nexapanel-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const currentPage = location.pathname.startsWith("/orders/")
    ? {
        title: "Order Details",
        eyebrow: "WORKSPACE / ORDERS / DETAILS",
        description: "Review order and customer information.",
      }
    : pageMetadata[location.pathname] ?? pageMetadata["/"];

  function toggleTheme() {
    setIsDark((current) => !current);
  }

  return (
    <div className={`app-layout ${isDark ? "theme-dark" : ""}`}>
      <Sidebar />

      <main className="main-content">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation menu"
          onClick={() => {
            window.dispatchEvent(new Event("open-sidebar"));
          }}
        >
          <Menu size={21} />
          <span>NexaPanel</span>
        </button>

        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
          title={currentPage.title}
          eyebrow={currentPage.eyebrow}
          description={currentPage.description}
        />

        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/orders" element={<OrdersTable />} />

            <Route
              path="/orders/:orderId"
              element={<OrderDetails />}
            />

            <Route path="/customers" element={<Customers />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
