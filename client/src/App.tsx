// biome-ignore assist/source/organizeImports: false positive
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Empresa from "./pages/Empresa";
import Specialists from "./pages/Specialists";
import PublicBooking from "./pages/PublicBooking";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, adminOnly }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Se não estiver autenticado e não estiver carregando, redirecione para login
    if (!isAuthenticated && !loading) {
      navigate("/login");
    }

    // Se a rota for apenas para admin e o usuário não for admin, redirecione
    if (adminOnly && user && !user.isAdmin) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate, adminOnly, user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    // Em vez de renderizar o Login diretamente, redirecionamos
    // Isso evita ciclos de autenticação automática
    return <div className="flex items-center justify-center min-h-screen">Redirecionando...</div>;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => {
        window.location.replace("/login");
        return <div />;
      }} />
      <Route path="/login" component={Login} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/redefinir-senha" component={RedefinirSenha} />
      <Route path="/agendar" component={PublicBooking} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/clientes" component={() => <ProtectedRoute component={Clients} />} />
      <Route path="/servicos" component={() => <ProtectedRoute component={Services} />} />
      <Route path="/agendamentos" component={() => <ProtectedRoute component={Appointments} />} />
      <Route path="/empresa" component={() => <ProtectedRoute component={Empresa} adminOnly />} />
      <Route path="/especialistas" component={() => <ProtectedRoute component={Specialists} />} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

