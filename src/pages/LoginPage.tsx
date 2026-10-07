import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isSessionTokenValid, useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  if (isSessionTokenValid(token)) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    const nextFieldErrors = {
      email: !normalizedEmail
        ? "Informe seu e-mail."
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
          ? ""
          : "Informe um e-mail válido.",
      password: !password
        ? "Informe sua senha."
        : password.length < 6
          ? "A senha deve ter pelo menos 6 caracteres."
          : "",
    };
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.email || nextFieldErrors.password || loading) return;

    setLoading(true);
    try {
      await login(normalizedEmail, password);
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#faf9f6] px-5 py-10 text-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2" aria-label="Voltar à página inicial">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">b.</span>
          <span className="text-2xl font-bold">bioweb</span>
        </Link>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Área administrativa</p>
          <h1 className="mt-2 text-3xl font-bold">Entrar no gerenciador</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Acesse para visualizar e gerenciar os contatos recebidos.</p>

          <form noValidate onSubmit={(event) => void handleSubmit(event)} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                id="login-email"
                required
                type="email"
                autoComplete="username"
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((current) => ({ ...current, email: "" }));
                  }
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 aria-[invalid=true]:border-red-500 md:text-sm"
                placeholder="admin@bioweb.local"
              />
              {fieldErrors.email && (
                <p id="login-email-error" className="mt-1.5 text-sm text-red-700">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative mt-2 w-full">
                <input
                  id="login-password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={128}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((current) => ({ ...current, password: "" }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                  className="w-full rounded-xl border border-slate-300 bg-[#faf9f6] px-4 py-3 pr-12 text-base font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 aria-[invalid=true]:border-red-500 md:text-sm"
                  placeholder="Sua senha administrativa"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  {showPassword ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.6 9.5 6.4a1.2 1.2 0 010 1.2 15 15 0 01-3.1 3.7M6.2 6.2a16 16 0 00-3.7 5.2 1.2 1.2 0 000 1.2C3.5 14.4 6.8 19 12 19c.8 0 1.6-.1 2.3-.3" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="login-password-error" className="mt-1.5 text-sm text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <Link to="/" className="mt-6 block text-center text-sm font-medium text-slate-500 hover:text-indigo-700">Voltar à BioWeb</Link>
        </section>
      </div>
    </main>
  );
}
