
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nexapanel-customers";

const initialCustomers = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia@example.com",
    company: "Acme Inc.",
    orders: 12,
    spent: 2450,
    status: "Active",
  },
  {
    id: 2,
    name: "Jackson Lee",
    email: "jackson@example.com",
    company: "TechFlow",
    orders: 8,
    spent: 1820,
    status: "Active",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    email: "isabella@example.com",
    company: "Bright Labs",
    orders: 15,
    spent: 3240,
    status: "Active",
  },
  {
    id: 4,
    name: "William Kim",
    email: "william@example.com",
    company: "Nova Studio",
    orders: 3,
    spent: 540,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Sophia Patel",
    email: "sophia@example.com",
    company: "Pixel Works",
    orders: 6,
    spent: 1290,
    status: "Active",
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james@example.com",
    company: "Cloud Nine",
    orders: 2,
    spent: 360,
    status: "Inactive",
  },
];

function loadCustomers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (customer) =>
            customer &&
            Number.isInteger(customer.id) &&
            typeof customer.name === "string" &&
            typeof customer.email === "string" &&
            typeof customer.company === "string" &&
            Number.isFinite(customer.orders) &&
            Number.isFinite(customer.spent) &&
            ["Active", "Inactive"].includes(customer.status),
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load customers:", error);
  }

  return initialCustomers.map((customer) => ({ ...customer }));
}

export const customersData = loadCustomers();

let currentCustomers = customersData;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentCustomers;
}

function persistCustomers(nextCustomers) {
  currentCustomers = nextCustomers;

  // Preserve the exported array reference for existing imports.
  customersData.splice(
    0,
    customersData.length,
    ...nextCustomers,
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextCustomers),
    );
  } catch (error) {
    console.error("Could not save customers:", error);
  }

  listeners.forEach((listener) => listener());
}

export function useCustomers() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
}

export function addCustomer(customer) {
  const nextId =
    currentCustomers.reduce(
      (maxId, item) => Math.max(maxId, item.id),
      0,
    ) + 1;

  const newCustomer = {
    id: nextId,
    name: customer.name.trim(),
    email: customer.email.trim(),
    company: customer.company.trim(),
    orders: 0,
    spent: 0,
    status: customer.status,
  };

  persistCustomers([...currentCustomers, newCustomer]);

  return newCustomer;
}

export function updateCustomer(id, updates) {
  const existing = currentCustomers.find(
    (customer) => customer.id === id,
  );

  if (!existing) return;

  const updatedCustomer = {
    ...existing,
    name: updates.name.trim(),
    email: updates.email.trim(),
    company: updates.company.trim(),
    status: updates.status,
  };

  persistCustomers(
    currentCustomers.map((customer) =>
      customer.id === id ? updatedCustomer : customer,
    ),
  );

  return updatedCustomer;
}

export function deleteCustomer(id) {
  const exists = currentCustomers.some(
    (customer) => customer.id === id,
  );

  if (!exists) return false;

  persistCustomers(
    currentCustomers.filter((customer) => customer.id !== id),
  );

  return true;
}
