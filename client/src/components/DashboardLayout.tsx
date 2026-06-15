// biome-ignore assist/source/organizeImports: false positive
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import {
  Calendar,
  Hand,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeft,
  Scissors,
  Star,
  User,
  Users,
  FileText,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { AccessibilityBar } from "./AccessibilityBar";
import { Button } from "./ui/button";
import BottomNav from "./BottomNav";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Scissors, label: "Serviços", path: "/servicos" },
  { icon: Package, label: "Produtos", path: "/produtos" },
  { icon: User, label: "Especialistas", path: "/especialistas" },
  { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
  { icon: Star, label: "Avaliações", path: "/avaliacoes" },
  { icon: Hand, label: "Ajuda Libras", path: "/ajuda-libras" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

// Constante de build - true quando buildado para mobile (VITE_MOBILE=true)
const IS_MOBILE_BUILD = import.meta.env.VITE_MOBILE === "true";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="h-20 w-20 rounded-xl object-cover shadow"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Faça login para continuar
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);

  usePushNotifications(!!user);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] min-h-screen h-screen flex flex-col"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center bg-[var(--sidebar)] border-b border-[var(--sidebar-border)]">
            <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:px-0 transition-all w-full bg-transparent">
              {isCollapsed ? (
                <div className="relative h-8 w-8 shrink-0 group">
                  <button
                    onClick={toggleSidebar}
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-[var(--sidebar-primary)] rounded-md ring-1 ring-[var(--sidebar-ring)] transition-opacity hover:bg-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] h-8 w-8"
                  >
                    <PanelLeft className="h-4 w-4 text-black" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setLocation("/dashboard")}
                    type="button"
                    className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-md px-2 py-1 -ml-2"
                  >
                    <span className="font-semibold tracking-tight truncate text-black">
                      {APP_TITLE}
                    </span>
                  </button>
                  <button
                    onClick={toggleSidebar}
                    type="button"
                    className="ml-auto h-8 w-8 flex items-center justify-center bg-transparent hover:bg-[var(--chart-3)] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] shrink-0"
                  >
                    <PanelLeft className="h-4 w-4 text-black" />
                  </button>
                </>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-transparent flex-1 overflow-auto">
            <SidebarMenu className="px-2 py-1 bg-[var(--sidebar)] flex-1 overflow-auto">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-12 transition-all font-normal ${isActive ? "bg-[var(--primary)] text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--chart-3)] hover:text-[var(--sidebar-foreground)]"}`}
                    >
                      <item.icon
                        className={`h-6 w-6 mr-2 ${isActive ? "text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70"}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {user?.role === "admin" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/empresa"}
                      onClick={() => setLocation("/empresa")}
                      tooltip="Empresa"
                      className={`h-12 transition-all font-normal ${location === "/empresa" ? "bg-[var(--primary)] text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--chart-3)] hover:text-[var(--sidebar-foreground)]"}`}
                    >
                      <User className={`h-6 w-6 mr-2 ${location === "/empresa" ? "text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70"}`} />
                      <span className="truncate">Empresa</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/usuarios"}
                      onClick={() => setLocation("/usuarios")}
                      tooltip="Usuários"
                      className={`h-12 transition-all font-normal ${location === "/usuarios" ? "bg-[var(--primary)] text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--chart-3)] hover:text-[var(--sidebar-foreground)]"}`}
                    >
                      <Users className={`h-6 w-6 mr-2 ${location === "/usuarios" ? "text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70"}`} />
                      <span className="truncate">Usuários</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/logs"}
                      onClick={() => setLocation("/logs")}
                      tooltip="Log sistema"
                      className={`h-12 transition-all font-normal ${location === "/logs" ? "bg-[var(--primary)] text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--chart-3)] hover:text-[var(--sidebar-foreground)]"}`}
                    >
                      <FileText className={`h-6 w-6 mr-2 ${location === "/logs" ? "text-[var(--sidebar-foreground)]" : "text-[var(--sidebar-foreground)]/70"}`} />
                      <span className="truncate">Log sistema</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="flex flex-col gap-2 p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar)]">
            {!isCollapsed && (
              <div className="flex justify-center pb-1">
                <AccessibilityBar />
              </div>
            )}
            <Button
              onClick={async () => {
                await logout();
                setLocation("/login");
              }}
              className={`flex items-center justify-center gap-2 text-[var(--sidebar-foreground)] font-semibold bg-[var(--sidebar-primary)] hover:bg-[var(--primary)] ${isCollapsed ? "w-12 h-12 p-0 rounded-md" : "w-full"}`}
            >
              <LogOut className="h-5 w-5 text-black" />
              {!isCollapsed && <span>Sair</span>}
            </Button>
          </SidebarFooter>
        </Sidebar>
        <button
          type="button"
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--chart-4)] transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
          aria-label="Redimensionar barra lateral"
        />
      </div>

      <SidebarInset>
        {IS_MOBILE_BUILD && (
          <div className="flex border-b h-14 items-center justify-between bg-[var(--sidebar)]/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40 safe-area-top">
            <span className="tracking-tight text-black font-semibold text-lg">
              {activeMenuItem?.label ?? APP_TITLE}
            </span>
            <AccessibilityBar />
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[var(--background)] dark:bg-[var(--card)] overflow-x-hidden pb-32">
          {children}
        </main>
      </SidebarInset>
      {IS_MOBILE_BUILD && <BottomNav />}
    </div>
  );
}
