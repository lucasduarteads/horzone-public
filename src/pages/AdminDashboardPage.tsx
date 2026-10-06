import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AdminServiceError,
  getLeads,
  updateLeadStatus,
  type AdminLead,
  type LeadStatus,
} from "../services/adminService";

const statusLabels: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  fechado: "Fechado",
};

const statusStyles: Record<LeadStatus, string> = {
  novo: "bg-blue-50 text-blue-700",
  em_atendimento: "bg-amber-50 text-amber-800",
  fechado: "bg-emerald-50 text-emerald-700",
};

const statusOptions: Array<LeadStatus | "todos"> = [
  "todos",
  "novo",
  "em_atendimento",
  "fechado",
];

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data indisponível"
    : new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
}

function getWhatsAppUrl(lead: AdminLead): string {
  const phoneNumber = lead.phone ?? lead.whatsapp ?? "";
  const phone = phoneNumber.replace(/\D/g, "");
  const message = `Olá, ${lead.name}! Aqui é da BioWeb. Recebemos seu contato e gostaríamos de conversar sobre: ${lead.message}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function AdminDashboardPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const loadLeads = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const response = await getLeads(
          token,
          filter === "todos" ? undefined : filter,
        );
        if (!signal?.aborted) setLeads(response.data);
      } catch (requestError) {
        if (signal?.aborted) return;
        if (
          requestError instanceof AdminServiceError &&
          requestError.status === 401
        ) {
          handleLogout();
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os contatos.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token, filter, handleLogout],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadLeads(controller.signal);
    return () => controller.abort();
  }, [loadLeads]);

  const changeStatus = async (lead: AdminLead, status: LeadStatus) => {
    if (!token || lead.status === status) return;
    setUpdatingId(lead._id);
    setError("");
    try {
      const updatedLead = await updateLeadStatus(token, lead._id, status);
      setLeads((current) => {
        if (filter !== "todos" && updatedLead.status !== filter) {
          return current.filter((item) => item._id !== updatedLead._id);
        }
        return current.map((item) =>
          item._id === updatedLead._id ? updatedLead : item,
        );
      });
    } catch (requestError) {
      if (
        requestError instanceof AdminServiceError &&
        requestError.status === 401
      ) {
        handleLogout();
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o contato.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2" aria-label="BioWeb">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">b.</span>
            <span className="text-xl font-bold">bioweb</span>
            <span className="hidden text-sm text-slate-400 sm:inline">/ Gerenciador</span>
          </a>
          <button onClick={handleLogout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Painel administrativo</p>
            <h1 className="mt-2 text-4xl font-bold">Contatos recebidos</h1>
            <p className="mt-2 text-sm text-slate-600">Gerencie os pedidos de contato da landing page BioWeb.</p>
          </div>
          <label className="text-sm font-semibold text-slate-700">
            Filtrar por status
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as LeadStatus | "todos")}
              className="mt-1.5 block min-w-48 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "todos" ? "Todos os contatos" : statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section aria-label="Lista de contatos" aria-busy={loading} className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">Carregando contatos...</p>
          ) : leads.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-lg font-semibold">Nenhum contato encontrado</p>
              <p className="mt-2 text-sm text-slate-500">Os novos contatos aparecerão aqui quando o formulário estiver conectado à API.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Cliente</th>
                    <th className="px-5 py-4 font-semibold">Telefone</th>
                    <th className="px-5 py-4 font-semibold">Mensagem</th>
                    <th className="px-5 py-4 font-semibold">Recebido</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{lead.name}</p>
                        <a href={`mailto:${lead.email}`} className="mt-1 inline-block text-xs text-indigo-700 hover:underline">{lead.email}</a>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">{lead.phone ?? lead.whatsapp ?? "—"}</td>
                      <td className="max-w-sm px-5 py-4 leading-5 text-slate-600">
                        <p>{lead.message}</p>
                        {lead.plan && <p className="mt-2 text-xs font-semibold text-slate-700">Plano: {lead.plan}</p>}
                        {lead.instagram && <p className="mt-1 break-all text-xs">Instagram/portfólio: {lead.instagram}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Status de ${lead.name}`}
                          value={lead.status}
                          disabled={updatingId === lead._id}
                          onChange={(event) => void changeStatus(lead, event.target.value as LeadStatus)}
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none disabled:opacity-60 ${statusStyles[lead.status]}`}
                        >
                          {(["novo", "em_atendimento", "fechado"] as const).map((status) => (
                            <option key={status} value={status}>{statusLabels[status]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <a href={getWhatsAppUrl(lead)} target="_blank" rel="noopener noreferrer" className="inline-flex whitespace-nowrap rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
                          Abrir WhatsApp ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="mt-4 text-xs leading-5 text-slate-500">Por segurança, saia do painel ao terminar de usar em um dispositivo compartilhado.</p>
      </div>
    </main>
  );
}
