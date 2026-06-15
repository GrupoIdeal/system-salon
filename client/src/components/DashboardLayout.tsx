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
import {
  Calendar,
  Hand,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Scissors,
  Star,
  User,
  Users,
  FileText,
} from "lucide-react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { AccessibilityBar } from "./AccessibilityBar";
import { Button } from "./ui/button";
import Footer from "./Footer";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-20 w-20 rounded-xl object-cover shadow"
            />
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
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar />
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

function DashboardSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="h-16 justify-center border-b">
        <div className="flex items-center gap-3 px-2 w-full">
          {!isCollapsed && (
            <>
              <button
                onClick={() => setLocation("/dashboard")}
                type="button"
                className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold tracking-tight truncate">
                  {APP_TITLE}
                </span>
              </button>
              <div className="flex-1" />
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-auto">
        <SidebarMenu>
          {menuItems.map(item => {
            const isActive = location === item.path;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => setLocation(item.path)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
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
                >
                  <User />
                  <span>Empresa</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === "/usuarios"}
                  onClick={() => setLocation("/usuarios")}
                  tooltip="Usuários"
                >
                  <Users />
                  <span>Usuários</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === "/logs"}
                  onClick={() => setLocation("/logs")}
                  tooltip="Log sistema"
                >
                  <FileText />
                  <span>Log sistema</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!isCollapsed && (
          <div className="flex justify-center pb-2">
            <AccessibilityBar />
          </div>
        )}
        <Button
          onClick={async () => {
            await logout();
            setLocation("/login");
          }}
          variant="outline"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const [location] = useLocation();
  const activeMenuItem = menuItems.find(item => item.path === location);

  usePushNotifications(!!user);

  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-4 border-b px-4 sticky top-0 bg-background z-30">
        <SidebarTrigger className="-ml-2" />
        <span className="font-semibold text-sm truncate">
          {activeMenuItem?.label ?? APP_TITLE}
        </span>
        <div className="flex-1" />
        <AccessibilityBar />
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden pb-8">
        {children}
      </main>
      <Footer />
    </SidebarInset>
  );
}
