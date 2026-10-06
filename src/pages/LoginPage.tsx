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

  if (isSessionTokenValid(token)) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
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

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-7 space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              E-mail
              <input
                required
                type="email"
                autoComplete="username"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#faf9f6] px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="admin@bioweb.local"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Senha
              <input
                required
                type="password"
                autoComplete="current-password"
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-[#faf9f6] px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Sua senha administrativa"
              />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
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
