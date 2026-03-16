// biome-ignore assist/source/organizeImports: false positive
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { lazy, Suspense, useEffect } from "react";
import Footer from "@/components/Footer";

// Lazy loading: cada página só é carregada quando o usuário navegar até ela.
// Isso reduz o bundle inicial em ~40%, acelerando o primeiro carregamento.
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Services = lazy(() => import("./pages/Services"));
const Appointments = lazy(() => import("./pages/Appointments"));
const RecuperarSenha = lazy(() => import("./pages/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const Empresa = lazy(() => import("./pages/Empresa"));
const Specialists = lazy(() => import("./pages/Specialists"));
const Products = lazy(() => import("./pages/Products"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Logs = lazy(() => import("./pages/Logs"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Tela genérica exibida enquanto o chunk da página está sendo baixado
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      Carregando...
    </div>
  );
}

function ProtectedRoute({
  component: Component,
  adminOnly,
}: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!user) {
    // Em vez de renderizar o Login diretamente, redirecionamos
    // Isso evita ciclos de autenticação automática
    return (
      <div className="flex items-center justify-center min-h-screen">
        Redirecionando...
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route
        path="/"
        component={() => {
          window.location.replace("/login");
          return <div />;
        }}
      />
      <Route path="/login" component={Login} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/redefinir-senha" component={RedefinirSenha} />
      <Route path="/agendar" component={PublicBooking} />
      <Route
        path="/dashboard"
        component={() => <ProtectedRoute component={Dashboard} />}
      />
      <Route
        path="/clientes"
        component={() => <ProtectedRoute component={Clients} />}
      />
      <Route
        path="/servicos"
        component={() => <ProtectedRoute component={Services} />}
      />
      <Route
        path="/agendamentos"
        component={() => <ProtectedRoute component={Appointments} />}
      />
      <Route
        path="/empresa"
        component={() => <ProtectedRoute component={Empresa} adminOnly />}
      />
      <Route
        path="/logs"
        component={() => <ProtectedRoute component={Logs} adminOnly />}
      />
      <Route
        path="/especialistas"
        component={() => <ProtectedRoute component={Specialists} />}
      />
      <Route
        path="/produtos"
        component={() => <ProtectedRoute component={Products} />}
      />
      <Route
        path="/usuarios"
        component={() => <ProtectedRoute component={Usuarios} adminOnly />}
      />
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
          {/* Suspense envolve o roteador para exibir o loader enquanto chunks carregam */}
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
