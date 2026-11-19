import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input, mensajeError } from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

interface EstadoRedireccion {
  from?: string;
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const cargandoSesion = useAuthStore((s) => s.cargando);
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as EstadoRedireccion | null)?.from ?? "/";
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        const u = await login({ username: value.username.trim(), password: value.password });
        toast.exito(`¡Hola, ${u.full_name}!`);
        navigate(destino, { replace: true });
      } catch (e) {
        setErrorServidor(handleApiError(e));
      }
    },
  });

  if (usuario && !cargandoSesion) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Ingresá a tu cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Para confirmar pedidos y ver tu historial.</p>
      </div>
      <Card>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (!value.trim() ? "Ingresá tu usuario" : undefined) }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field name="password" validators={{ onChange: ({ value }) => (!value ? "Ingresá tu contraseña" : undefined) }}>
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          {errorServidor && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorServidor}</p>}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{" "}
          <Link to="/register" state={location.state} className="font-medium text-marca-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
