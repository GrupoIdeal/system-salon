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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Calendar, LayoutDashboard, LogOut, PanelLeft, Scissors, User, Users } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Scissors, label: "Serviços", path: "/servicos" },
  { icon: User, label: "Especialistas", path: "/especialistas" },
  { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

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
    return <DashboardLayoutSkeleton />
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
  const isMobile = useIsMobile();

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
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-slate-900 text-slate-100 min-h-screen h-screen flex flex-col"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:px-0 transition-all w-full bg-transparent">
              {isCollapsed ? (
                <div className="relative h-8 w-8 shrink-0 group">
                  {/* Removido a logo quando colapsado */}
                  <button
                    onClick={toggleSidebar}
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-md ring-1 ring-slate-700 transition-opacity hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 h-8 w-8"
                  >
                    <PanelLeft className="h-4 w-4 text-slate-100" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Logo e título */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/*  <img
                      src={APP_LOGO}
                      className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
                      alt="Logo"
                    /> */}
                    <span className="font-semibold tracking-tight truncate text-slate-100">
                      {APP_TITLE}
                    </span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    type="button"
                    className="ml-auto h-8 w-8 flex items-center justify-center bg-transparent hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
                  >
                    <PanelLeft className="h-4 w-4 text-slate-300" />
                  </button>
                </>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-transparent flex-1 overflow-auto">
            <SidebarMenu className="px-2 py-1 bg-slate-900 flex-1 overflow-auto">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-12 transition-all font-normal ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <item.icon
                        className={`h-6 w-6 mr-2 ${isActive ? 'text-blue-400' : 'text-slate-300'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* Menu de administração só para admin */}
              {user?.role === "admin" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/empresa"}
                      onClick={() => setLocation("/empresa")}
                      tooltip="Empresa"
                      className={`h-12 transition-all font-normal ${location === "/empresa" ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <User className={`h-6 w-6 mr-2 ${location === "/empresa" ? 'text-blue-400' : 'text-slate-300'}`} />
                      <span className="truncate">Empresa</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="flex items-center p-4 border-t border-slate-700 bg-slate-900">
            <Button
              onClick={async () => {
                await logout();
                setLocation("/login");
              }}
              className={`flex items-center justify-center gap-2 text-slate-200 font-semibold bg-slate-800 hover:bg-slate-700 ${isCollapsed ? 'w-12 h-12 p-0 rounded-md' : 'w-full'}`}
            >
              <LogOut className="h-5 w-5 text-slate-200" />
              {!isCollapsed && <span>Sair</span>}
            </Button>
          </SidebarFooter>
        </Sidebar>
        <button
          type="button"
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-slate-700 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
          aria-label="Redimensionar barra lateral"
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-slate-900/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-slate-800 text-slate-100" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-slate-100 font-semibold">
                    {activeMenuItem?.label ?? APP_TITLE}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 bg-slate-50 dark:bg-slate-800">{children}</main>
      </SidebarInset>
    </>
  );
}
