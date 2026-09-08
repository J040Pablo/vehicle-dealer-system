import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, CheckCircle2, Lock, User as UserIcon, Shield, UserPlus, LogIn } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { Avatar } from "@/shared/components/ui/avatar";
import { ThemeToggle } from "@/shared/components/theme-toggle";

import { loginSchema, registerSchema, type LoginCredentials, type RegisterCredentials } from "../types/auth";
import { useLogin, useRegister } from "../hooks/use-auth";
import { getErrorMessage } from "@/shared/api/error";

type AuthMode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister(() => {
    setRegisterSuccessMessage("Conta criada com sucesso! Faça login para continuar.");
    setMode("login");
    loginForm.setValue("username", registerForm.getValues("username"));
    registerForm.reset();
  });

  const loginForm = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(data: LoginCredentials) {
    setRegisterSuccessMessage(null);
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterCredentials) {
    setRegisterSuccessMessage(null);
    registerMutation.mutate(data);
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setRegisterSuccessMessage(null);
    loginMutation.reset();
    registerMutation.reset();
  }

  const isLoading = mode === "login" ? loginMutation.isPending : registerMutation.isPending;
  const isError = mode === "login" ? loginMutation.isError : registerMutation.isError;
  const error = mode === "login" ? loginMutation.error : registerMutation.error;
  const isSuccess = mode === "login" ? loginMutation.isSuccess : registerMutation.isSuccess;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 antialiased selection:bg-foreground/10 selection:text-foreground">
      {/* Theme Toggle Top-Right Positioned */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="w-full shadow-lg border-border/80 bg-card">
          {/* Header: Logo & Title */}
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="flex items-center justify-center">
              <Avatar
                className="h-14 w-14 rounded-xl bg-foreground text-background font-bold text-xl shadow-md border-0"
                fallback="V"
              />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Vehicle Dealer
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Informe suas credenciais para acessar a plataforma"
                  : "Preencha os dados abaixo para criar sua conta"}
              </CardDescription>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid w-full grid-cols-2 p-1 bg-muted rounded-lg text-xs font-semibold mt-2">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                size="sm"
                onClick={() => switchMode("login")}
                className="h-8 text-xs font-medium rounded-md transition-all"
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Entrar
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "ghost"}
                size="sm"
                onClick={() => switchMode("register")}
                className="h-8 text-xs font-medium rounded-md transition-all"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Cadastrar
              </Button>
            </div>
          </CardHeader>

          <div className="px-6">
            <Separator />
          </div>

          {/* Content: Feedback Alerts & Form */}
          <CardContent className="space-y-4 pt-6">
            {/* Success Alert after Registration */}
            {registerSuccessMessage && mode === "login" && (
              <Alert className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 animate-in fade-in-50 duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="font-semibold">Cadastro Realizado!</AlertTitle>
                <AlertDescription className="text-xs">
                  {registerSuccessMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Feedback States using shadcn Alert */}
            {isError && (
              <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <AlertTitle className="font-semibold">
                  {mode === "login" ? "Falha na autenticação" : "Falha no cadastro"}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {getErrorMessage(error) ||
                    (mode === "login"
                      ? "Credenciais inválidas. Verifique seu usuário e senha."
                      : "Não foi possível realizar o cadastro. Tente outro usuário.")}
                </AlertDescription>
              </Alert>
            )}

            {isSuccess && mode === "login" && (
              <Alert className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 animate-in fade-in-50 duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="font-semibold">Login realizado!</AlertTitle>
                <AlertDescription className="text-xs">
                  Autenticação concluída com sucesso. Redirecionando para o sistema...
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Alert className="border-border bg-accent/30 text-foreground animate-in fade-in-50 duration-200">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                <AlertTitle className="font-semibold">Processando</AlertTitle>
                <AlertDescription className="text-xs">
                  {mode === "login"
                    ? "Validando credenciais com o servidor de segurança..."
                    : "Criando seu usuário no servidor de segurança..."}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Usuário
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Digite seu usuário..."
                              autoComplete="username"
                              disabled={isLoading || isSuccess}
                              className="pl-9 text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Digite sua senha..."
                              autoComplete="current-password"
                              disabled={isLoading || isSuccess}
                              className="pl-9 text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold shadow-sm text-sm tracking-tight mt-2"
                    disabled={isLoading || isSuccess}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Autenticando...
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar no sistema"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              /* Registration Form */
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Usuário
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Escolha um nome de usuário..."
                              autoComplete="username"
                              disabled={isLoading}
                              className="pl-9 text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Escolha uma senha (mín. 6 caracteres)..."
                              autoComplete="new-password"
                              disabled={isLoading}
                              className="pl-9 text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Confirmar Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Repita a senha escolhida..."
                              autoComplete="new-password"
                              disabled={isLoading}
                              className="pl-9 text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold shadow-sm text-sm tracking-tight mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col items-center justify-center border-t border-border/60 py-4 text-center">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Vehicle Dealer Management System &copy; 2026</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
