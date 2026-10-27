
import {
    DollarSign,
    ShoppingBag,
    Users,
    TrendingUp,
  } from "lucide-react";
  
  import { useOrders } from "../data/orders";
  import { useCustomers } from "../data/customers";
  
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  
  const statsConfig = [
    {
      label: "Total Revenue",
      icon: DollarSign,
      color: "purple",
      description: "From completed orders",
    },
    {
      label: "Total Orders",
      icon: ShoppingBag,
      color: "blue",
      description: "Current orders",
    },
    {
      label: "Total Customers",
      icon: Users,
      color: "orange",
      description: "Registered customers",
    },
    {
      label: "Conversion Rate",
      icon: TrendingUp,
      color: "green",
      description: "Sample metric",
    },
  ];
  
  export default function StatCards() {
    const orders = useOrders();
    const customers = useCustomers();
  
    const totalRevenue = orders.reduce((total, order) => {
      if (order.status !== "Completed") {
        return total;
      }
  
      return total + (Number(order.amount) || 0);
    }, 0);
  
    const stats = [
      {
        ...statsConfig[0],
        value: currencyFormatter.format(totalRevenue),
        change: "Live",
      },
      {
        ...statsConfig[1],
        value: orders.length.toLocaleString("en-US"),
        change: "Live",
      },
      {
        ...statsConfig[2],
        value: customers.length.toLocaleString("en-US"),
        change: "Live",
      },
      {
        ...statsConfig[3],
        value: "3.64%",
        change: "Demo",
      },
    ];
  
    return (
      <section
        className="stats-grid"
        aria-label="Store statistics"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
  
          return (
            <article className="stat-card" key={stat.label}>
              <div className="stat-card__top">
                <span className="stat-card__label">
                  {stat.label}
                </span>
  
                <span
                  className={`stat-card__icon ${stat.color}`}
                >
                  <Icon size={20} />
                </span>
              </div>
  
              <strong className="stat-card__value">
                {stat.value}
              </strong>
  
              <div className="stat-card__footer">
                <span className="stat-card__change">
                  {stat.change}
                </span>
  
                <span>{stat.description}</span>
              </div>
            </article>
          );
        })}
      </section>
    );
  }
  