import { useLocation } from "wouter";
import {
  Calendar,
  LayoutDashboard,
  Package,
  Scissors,
  Users,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Início", path: "/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/agendamentos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Scissors, label: "Serviços", path: "/servicos" },
  { icon: Package, label: "Produtos", path: "/produtos" },
];

export default function BottomNav() {
  const [, setLocation] = useLocation();

  return (
    <nav
      id="mobile-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        height: "64px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        pointerEvents: "auto",
        width: "100vw",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {menuItems.map(item => (
        <button
          key={item.path}
          onClick={() => setLocation(item.path)}
          type="button"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            flex: 1,
            height: "100%",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <item.icon style={{ width: "20px", height: "20px" }} />
          <span style={{ fontSize: "10px", fontWeight: 500, lineHeight: 1 }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
