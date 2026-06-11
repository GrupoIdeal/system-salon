import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Bug, AlertCircle } from "lucide-react";
import { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary global para captura de erros em toda a aplicação
 * @description Componente que envolve a aplicação e captura erros não tratados
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logar erro para serviço de monitoring (ex: Sentry, LogRocket)
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    
    // Chamar callback de erro se fornecido
    this.props.onError?.(error, errorInfo);
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Se fallback customizado for fornecido, usá-lo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "p-3 rounded-full",
                  "bg-destructive/10 dark:bg-destructive/20"
                )}>
                  <AlertTriangle
                    size={48}
                    className="text-destructive flex-shrink-0"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription>
                Encontramos um erro inesperado. Não se preocupe, vamos resolver isso.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Detalhes do erro */}
              {this.state.error && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Bug size={16} />
                    <span>Detalhes técnicos:</span>
                  </div>
                  <div className="p-4 w-full rounded-md bg-muted overflow-auto max-h-48">
                    <pre className="text-xs text-muted-foreground whitespace-break-spaces font-mono">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack && (
                        <>\n\n{this.state.errorInfo.componentStack}</>
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {/* Dicas de solução */}
              <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                  <div className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium">Tente estas soluções:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                      <li>Recarregue a página</li>
                      <li>Limpe o cache do navegador</li>
                      <li>Verifique sua conexão com a internet</li>
                      <li>Se o problema persistir, entre em contato com o suporte</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={this.handleReload}
                  variant="default"
                  className="gap-2"
                >
                  <RotateCcw size={16} />
                  Recarregar Página
                </Button>
                
                {this.state.errorInfo && (
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Hook para usar ErrorBoundary funcionalmente
 * @example const { hasError, error, resetError } = useErrorBoundary();
 */
export function useErrorBoundary() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Pode ser integrado com serviços de logging
    console.error("[useErrorBoundary]", error, errorInfo);
  };

  return {
    hasError: false,
    error: null as Error | null,
    resetError: () => {},
    handleError,
  };
}
