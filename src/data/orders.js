
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nexapanel-orders";

const initialOrders = [
  {
    id: "#NX-1042",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    initials: "OM",
    color: "lavender",
    date: "Oct 24, 2026",
    amount: 245,
    status: "Completed",
  },
  {
    id: "#NX-1041",
    customer: "Jackson Lee",
    email: "jackson@example.com",
    initials: "JL",
    color: "blue",
    date: "Oct 23, 2026",
    amount: 180.5,
    status: "Processing",
  },
  {
    id: "#NX-1040",
    customer: "Isabella Chen",
    email: "isabella@example.com",
    initials: "IC",
    color: "peach",
    date: "Oct 23, 2026",
    amount: 320,
    status: "Completed",
  },
  {
    id: "#NX-1039",
    customer: "William Kim",
    email: "william@example.com",
    initials: "WK",
    color: "mint",
    date: "Oct 22, 2026",
    amount: 89.99,
    status: "Pending",
  },
  {
    id: "#NX-1038",
    customer: "Sophia Patel",
    email: "sophia@example.com",
    initials: "SP",
    color: "pink",
    date: "Oct 21, 2026",
    amount: 560,
    status: "Cancelled",
  },
  {
    id: "#NX-1037",
    customer: "Noah Williams",
    email: "noah@example.com",
    initials: "NW",
    color: "blue",
    date: "Oct 20, 2026",
    amount: 129.5,
    status: "Completed",
  },
];

function loadOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (order) =>
            order &&
            typeof order.id === "string" &&
            typeof order.customer === "string" &&
            typeof order.amount === "number",
        )
      ) {
        return parsed;
      }
    }
  } catch {
    // Fall back to the sample data if storage is unavailable.
  }

  return initialOrders.map((order) => ({ ...order }));
}

// Keep the original export compatible with existing imports.
export const orders = loadOrders();

let currentOrders = orders;
const listeners = new Set();

function getSnapshot() {
  return currentOrders;
}

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function persist(nextOrders) {
  currentOrders = nextOrders;

  // Keep existing imports of `orders` synchronized.
  orders.splice(0, orders.length, ...nextOrders);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextOrders),
    );
  } catch {
    // The current session can still use the updated data.
  }

  notify();
}

export function useOrders() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function addOrder(order) {
  if (currentOrders.some((item) => item.id === order.id)) {
    throw new Error("An order with this ID already exists.");
  }

  persist([order, ...currentOrders]);
}

export function updateOrder(id, updates) {
  const exists = currentOrders.some(
    (order) => order.id === id,
  );

  if (!exists) {
    throw new Error("Order not found.");
  }

  const nextOrders = currentOrders.map((order) =>
    order.id === id ? { ...order, ...updates, id } : order,
  );

  persist(nextOrders);
}

export function deleteOrder(id) {
  const exists = currentOrders.some(
    (order) => order.id === id,
  );

  if (!exists) {
    return false;
  }

  const nextOrders = currentOrders.filter(
    (order) => order.id !== id,
  );

  persist(nextOrders);

  return true;
}
