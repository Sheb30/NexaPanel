import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  Settings,
  PanelLeftClose,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Orders", icon: ShoppingCart, path: "/orders" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Analytics", icon: ChartNoAxesCombined, path: "/analytics" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    function openMenu() {
      setIsOpen(true);
    }

    window.addEventListener("open-sidebar", openMenu);

    return () => {
      window.removeEventListener("open-sidebar", openMenu);
    };
  }, []);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <LayoutDashboard size={21} />
          </div>

          <span>NexaPanel</span>

          <button
            type="button"
            className="sidebar__close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar__section">
          <p className="sidebar__section-title">MENU</p>

          <nav className="sidebar__nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? "is-active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar__bottom">
          <div className="sidebar__profile">
            <div className="sidebar__avatar">SE</div>

            <div className="sidebar__profile-info">
              <strong>Shahab Ebrahimi</strong>
              <span>Administrator</span>
            </div>

            <PanelLeftClose size={18} />
          </div>
        </div>
      </aside>
    </>
  );
}