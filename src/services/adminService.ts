export type LeadStatus = "novo" | "em_atendimento" | "fechado";

export interface AdminLead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  plan?: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

interface LeadsResponse {
  data: AdminLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AdminServiceError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "AdminServiceError";
  }
}

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) throw new AdminServiceError("Configure VITE_API_URL para acessar o painel.");
  return apiUrl.replace(/\/+$/, "");
}

async function authorizedRequest(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new AdminServiceError("Não foi possível conectar à API.");
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : `Falha na solicitação (HTTP ${response.status}).`;
    throw new AdminServiceError(message, response.status);
  }
  return body;
}

export async function getLeads(
  token: string,
  status?: LeadStatus,
): Promise<LeadsResponse> {
  const query = new URLSearchParams({ page: "1", limit: "100" });
  if (status) query.set("status", status);
  const result = await authorizedRequest(
    `/api/v1/admin/leads?${query.toString()}`,
    token,
  );

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    !Array.isArray(result.data) ||
    !("pagination" in result) ||
    typeof result.pagination !== "object" ||
    result.pagination === null
  ) {
    throw new AdminServiceError("A API retornou uma lista de contatos inválida.");
  }
  return result as LeadsResponse;
}

export async function updateLeadStatus(
  token: string,
  leadId: string,
  status: LeadStatus,
): Promise<AdminLead> {
  const result = await authorizedRequest(
    `/api/v1/admin/leads/${encodeURIComponent(leadId)}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result) ||
    typeof result.data !== "object" ||
    result.data === null ||
    !("_id" in result.data) ||
    typeof result.data._id !== "string"
  ) {
    throw new AdminServiceError("A API retornou um contato atualizado inválido.");
  }
  return result.data as AdminLead;
}

export async function deleteLead(
  leadId: string,
  token: string,
): Promise<void> {
  await authorizedRequest(
    `/api/v1/leads/${encodeURIComponent(leadId)}`,
    token,
    { method: "DELETE" },
  );
}
