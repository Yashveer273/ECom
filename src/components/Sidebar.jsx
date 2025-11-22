import SidebarLink from "./SidebarLink";
import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Users,
  Store,
  BarChart2,
  CreditCard,
  Truck,
  Settings,
} from "lucide-react";
import "./sidebar.css";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {!isSidebarOpen && (
        <button className="open-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      {isSidebarOpen && (
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
          <X size={20} />
        </button>
      )}

      {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <nav className="p-4 space-y-2 mt-1">
          <SidebarLink to="/" icon={LayoutDashboard}>
            Dashboard Home
          </SidebarLink>

          <div className="pt-4">
            <p className="section-title">E-commerce</p>

            <SidebarLink to="/products" icon={ShoppingBag}>Products</SidebarLink>
            <SidebarLink to="/orders" icon={ListOrdered}>Orders</SidebarLink>
            <SidebarLink to="/users" icon={Users}>Customers</SidebarLink>
            <SidebarLink to="/vendors" icon={Store}>Vendors</SidebarLink>
          </div>

          <div className="pt-4">
            <p className="section-title">Analytics</p>

            <SidebarLink to="/reports" icon={BarChart2}>Sales Reports</SidebarLink>
            <SidebarLink to="/transactions" icon={CreditCard}>Transactions</SidebarLink>
            <SidebarLink to="/shipping" icon={Truck}>Shipping Status</SidebarLink>
          </div>

          <div className="pt-4">
            <p className="section-title">System</p>

            <SidebarLink to="/settings" icon={Settings}>System Settings</SidebarLink>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
