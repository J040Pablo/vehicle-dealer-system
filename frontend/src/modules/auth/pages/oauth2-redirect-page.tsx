import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useExchangeOAuth2Code } from "../hooks/use-auth";
import { getErrorMessage } from "@/shared/api/error";

export function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangeMutation = useExchangeOAuth2Code();

  const code = searchParams.get("code");
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (code && !exchangeMutation.isPending && !exchangeMutation.isSuccess && !exchangeMutation.isError) {
      exchangeMutation.mutate(code);
    }
  }, [code, exchangeMutation]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 antialiased">
      <Card className="w-full max-w-md shadow-lg border-border/80 bg-card">
        <CardHeader className="space-y-2 text-center pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Autenticação com Google
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Finalizando o processo de login seguro...
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {exchangeMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Validando seu código de acesso...
              </p>
            </div>
          )}

          {exchangeMutation.isSuccess && (
            <Alert className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="font-semibold">Autenticado com sucesso!</AlertTitle>
              <AlertDescription className="text-xs">
                Redirecionando para o sistema...
              </AlertDescription>
            </Alert>
          )}

          {(exchangeMutation.isError || urlError || (!code && !exchangeMutation.isPending)) && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <AlertTitle className="font-semibold">Falha na Autenticação Google</AlertTitle>
                <AlertDescription className="text-xs">
                  {urlError
                    ? `Erro retornado pelo Google: ${urlError}`
                    : exchangeMutation.isError
                    ? getErrorMessage(exchangeMutation.error)
                    : "Código de autorização OAuth2 inválido ou ausente."}
                </AlertDescription>
              </Alert>

              <Button asChild className="w-full">
                <Link to="/login">Voltar para a página de Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
