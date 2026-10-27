
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Download } from "lucide-react";

import { useOrders } from "../data/orders";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function getChartData(orders, period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = period === "7 days" ? 7 : period === "30 days" ? 30 : 90;

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days + 1);

  const buckets = new Map();

  // Create every bucket, including periods with no orders.
  for (
    let date = new Date(startDate);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    let key;
    let label;

    if (period === "7 days") {
      key = getDateKey(date);
      label = date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    } else if (period === "30 days") {
      const difference = Math.floor(
        (date.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const weekNumber = Math.floor(difference / 7) + 1;

      key = `week-${weekNumber}`;
      label = `Week ${weekNumber}`;
    } else {
      key = getMonthKey(date);
      label = date.toLocaleDateString("en-US", {
        month: "short",
      });
    }

    if (!buckets.has(key)) {
      buckets.set(key, {
        day: label,
        sales: 0,
        orders: 0,
      });
    }
  }

  // Aggregate current orders into the appropriate buckets.
  orders.forEach((order) => {
    if (!order.date) return;

    const orderDate = new Date(order.date);

    if (Number.isNaN(orderDate.getTime())) return;

    orderDate.setHours(0, 0, 0, 0);

    if (orderDate < startDate || orderDate > today) {
      return;
    }

    let key;

    if (period === "7 days") {
      key = getDateKey(orderDate);
    } else if (period === "30 days") {
      const difference = Math.floor(
        (orderDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      key = `week-${Math.floor(difference / 7) + 1}`;
    } else {
      key = getMonthKey(orderDate);
    }

    const bucket = buckets.get(key);

    if (!bucket) return;

    // Count every order, but recognize revenue only
    // when an order has been completed.
    bucket.orders += 1;

    if (order.status === "Completed") {
      bucket.sales += Number(order.amount) || 0;
    }
  });

  return Array.from(buckets.values());
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      <strong>{money.format(point.sales)}</strong>
      <span>{point.orders} orders</span>
    </div>
  );
}

export default function SalesChart() {
  const [period, setPeriod] = useState("30 days");
  const orders = useOrders();

  const data = useMemo(
    () => getChartData(orders, period),
    [orders, period],
  );

  const totalSales = data.reduce(
    (sum, item) => sum + item.sales,
    0,
  );

  const totalOrders = data.reduce(
    (sum, item) => sum + item.orders,
    0,
  );

  function handleExport() {
    const headers = ["Period", "Sales (USD)", "Orders"];

    const rows = data.map((item) => [
      item.day,
      item.sales.toFixed(2),
      item.orders,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `sales-${period.replace(" ", "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="sales-card">
      <div className="sales-card__header">
        <div>
          <span className="sales-card__eyebrow">
            REVENUE OVERVIEW
          </span>

          <h2>Sales Analytics</h2>

          <p>Track your revenue performance over time.</p>
        </div>

        <button
          type="button"
          className="export-button"
          onClick={handleExport}
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="sales-summary">
        <div>
          <span className="sales-summary__label">
            Total sales
          </span>

          <strong>{money.format(totalSales)}</strong>
        </div>

        <span className="sales-summary__change">
          <ArrowUpRight size={15} />
          {totalOrders.toLocaleString("en-US")}
          <span>orders in this period</span>
        </span>
      </div>

      <div className="sales-chart-toolbar">
        <div className="chart-legend">
          <span className="chart-legend__dot" />
          <span>Sales revenue</span>
        </div>

        <div
          className="period-switcher"
          aria-label="Select chart period"
        >
          {["7 days", "30 days", "90 days"].map((option) => (
            <button
              type="button"
              key={option}
              className={period === option ? "is-selected" : ""}
              aria-pressed={period === option}
              onClick={() => setPeriod(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="sales-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 8, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="salesGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#7868e8"
                  stopOpacity={0.22}
                />
                <stop
                  offset="95%"
                  stopColor="#7868e8"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#eff0f6"
              strokeDasharray="4 5"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9295a9", fontSize: 11 }}
              dy={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9295a9", fontSize: 10 }}
              tickFormatter={(value) =>
                value >= 1000
                  ? `$${Math.round(value / 1000)}k`
                  : `$${value}`
              }
              width={48}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: "#c8c0ff",
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#7868e8"
              strokeWidth={3}
              fill="url(#salesGradient)"
              activeDot={{
                r: 5,
                fill: "#7868e8",
                stroke: "#fff",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="sales-card__footer">
        <span>Based on current order data</span>
        <span>{data.length} data points</span>
      </div>
    </section>
  );
}
