
import StatCards from "../components/StatCards";
import SalesChart from "../components/SalesChart";
import OrdersTable from "../components/OrdersTable";

export default function Dashboard() {
  return (
    <>
      <StatCards />
      <SalesChart />
      <OrdersTable />
    </>
  );
}
