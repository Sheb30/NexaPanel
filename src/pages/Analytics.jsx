
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const analyticsData = {
  "7d": [
    { label: "Mon", revenue: 820, orders: 24 },
    { label: "Tue", revenue: 1120, orders: 31 },
    { label: "Wed", revenue: 950, orders: 27 },
    { label: "Thu", revenue: 1450, orders: 38 },
    { label: "Fri", revenue: 1280, orders: 34 },
    { label: "Sat", revenue: 1720, orders: 46 },
    { label: "Sun", revenue: 1560, orders: 42 },
  ],
  "30d": [
    { label: "Week 1", revenue: 5200, orders: 124 },
    { label: "Week 2", revenue: 6800, orders: 158 },
    { label: "Week 3", revenue: 5900, orders: 141 },
    { label: "Week 4", revenue: 8400, orders: 196 },
  ],
  "90d": [
    { label: "Month 1", revenue: 18500, orders: 420 },
    { label: "Month 2", revenue: 22300, orders: 518 },
    { label: "Month 3", revenue: 26800, orders: 624 },
  ],
};

const periodLabels = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Analytics() {
  const [period, setPeriod] = useState("30d");
  const [metric, setMetric] = useState("revenue");

  const chartData = analyticsData[period];

  const totals = useMemo(
    () =>
      chartData.reduce(
        (result, item) => ({
          revenue: result.revenue + item.revenue,
          orders: result.orders + item.orders,
        }),
        { revenue: 0, orders: 0 },
      ),
    [chartData],
  );

  function exportAnalytics() {
    const headers = ["Period", "Revenue (USD)", "Orders"];
    const rows = chartData.map((item) => [
      item.label,
      item.revenue,
      item.orders,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `nexapanel-analytics-${period}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const metrics = [
    {
      label: "Total revenue",
      value: currency.format(totals.revenue),
      change: "+12.8%",
      positive: true,
      icon: Wallet,
      color: "purple",
    },
    {
      label: "Total orders",
      value: totals.orders.toLocaleString("en-US"),
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
      color: "blue",
    },
    {
      label: "Avg. revenue per order",
      value: currency.format(
        totals.orders ? totals.revenue / totals.orders : 0,
      ),
      change: "+3.4%",
      positive: true,
      icon: Activity,
      color: "orange",
    },
    {
      label: "Customer growth",
      value: "+18.6%",
      change: "-1.2%",
      positive: false,
      icon: Users,
      color: "green",
    },
  ];

  return (
    <section className="page-content analytics-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">BUSINESS INTELLIGENCE</p>
          <h2>Analytics</h2>
          <p className="page-description">
            Track revenue, orders, and business performance over time.
          </p>
        </div>

        <button
          type="button"
          className="primary-action-button"
          onClick={exportAnalytics}
        >
          <Download size={17} />
          <span>Export report</span>
        </button>
      </div>

      <div className="analytics-toolbar">
        <span className="analytics-toolbar-label">Reporting period</span>

        <div className="analytics-period-control">
          {Object.entries(periodLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={period === value ? "is-selected" : ""}
              onClick={() => setPeriod(value)}
              aria-pressed={period === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-metrics-grid">
        {metrics.map((item) => {
          const Icon = item.icon;
          const TrendIcon = item.positive ? ArrowUpRight : ArrowDownRight;

          return (
            <article className="analytics-metric-card" key={item.label}>
              <div className="analytics-metric-top">
                <div className={`analytics-metric-icon metric-${item.color}`}>
                  <Icon size={20} />
                </div>
                <span
                  className={`analytics-change ${
                    item.positive ? "change-positive" : "change-negative"
                  }`}
                >
                  <TrendIcon size={15} />
                  {item.change}
                </span>
              </div>

              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span className="analytics-metric-caption">
                Compared with previous period
              </span>
            </article>
          );
        })}
      </div>

      <div className="analytics-chart-card">
        <div className="analytics-chart-heading">
          <div>
            <h3>Performance overview</h3>
            <p>{periodLabels[period]}</p>
          </div>

          <div className="analytics-metric-control">
            <button
              type="button"
              className={metric === "revenue" ? "is-selected" : ""}
              onClick={() => setMetric("revenue")}
              aria-pressed={metric === "revenue"}
            >
              Revenue
            </button>
            <button
              type="button"
              className={metric === "orders" ? "is-selected" : ""}
              onClick={() => setMetric("orders")}
              aria-pressed={metric === "orders"}
            >
              Orders
            </button>
          </div>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--chart-grid, #ececf3)"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-text, #85869a)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={metric === "revenue" ? 62 : 40}
                tick={{ fill: "var(--muted-text, #85869a)", fontSize: 12 }}
                tickFormatter={(value) =>
                  metric === "revenue"
                    ? `$${(value / 1000).toFixed(value >= 1000 ? 1 : 0)}k`
                    : value
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  metric === "revenue"
                    ? currency.format(Number(value))
                    : Number(value).toLocaleString("en-US"),
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--chart-grid, #ececf3)",
                  background: "var(--card-bg, #ffffff)",
                  color: "var(--text-color, #22243a)",
                }}
              />
              <Line
                type="monotone"
                dataKey={metric}
                name={metric}
                stroke="#7868f8"
                strokeWidth={3}
                dot={{ r: 4, fill: "#7868f8", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
