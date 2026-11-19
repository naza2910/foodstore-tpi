import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { register } from "@/features/auth/api/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input, mensajeError } from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_.-]+$/;

export function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from ?? "/";
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        // Registro exitoso: iniciamos sesión directamente.
        await login({ username: value.username.trim(), password: value.password });
        toast.exito("¡Cuenta creada! Ya podés hacer tu pedido.");
        navigate(destino, { replace: true });
      } catch (e) {
        setErrorServidor(handleApiError(e));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Creá tu cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Te lleva menos de un minuto.</p>
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
            validators={{
              onChange: ({ value }) => {
                const v = value.trim();
                if (v.length < 3) return "Mínimo 3 caracteres";
                if (v.length > 50) return "Máximo 50 caracteres";
                if (!USERNAME_RE.test(v)) return "Solo letras, números, punto, guion y guion bajo";
                return undefined;
              },
            }}
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

          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim().length < 2 ? "Ingresá tu nombre completo" : undefined) }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (!EMAIL_RE.test(value.trim()) ? "Email inválido" : undefined) }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length < 8 ? "Mínimo 8 caracteres" : undefined) }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                ayuda="Mínimo 8 caracteres"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Repetí la contraseña"
                type="password"
                autoComplete="new-password"
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
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" state={location.state} className="font-medium text-marca-700 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  );
}
