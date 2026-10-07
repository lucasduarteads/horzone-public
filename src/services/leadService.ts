export interface LeadSubmission {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  plan: string;
  message: string;
}

export class LeadServiceError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "LeadServiceError";
  }
}

const warmupTtlMs = 60_000;
let warmupPromise: Promise<void> | undefined;
let lastWarmupAt = 0;

export function warmLeadService(): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    return Promise.reject(
      new LeadServiceError("O serviço está temporariamente indisponível."),
    );
  }

  if (warmupPromise) return warmupPromise;
  if (Date.now() - lastWarmupAt < warmupTtlMs) return Promise.resolve();

  warmupPromise = fetch(`${apiUrl.replace(/\/+$/, "")}/health`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
    .then((response) => {
      if (!response.ok) {
        throw new LeadServiceError(
          "Não foi possível aquecer a conexão com o servidor.",
          response.status,
        );
      }
      lastWarmupAt = Date.now();
    })
    .catch((error: unknown) => {
      warmupPromise = undefined;
      throw error;
    })
    .finally(() => {
      warmupPromise = undefined;
    });

  return warmupPromise;
}

export async function submitLead(lead: LeadSubmission): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    throw new LeadServiceError("O serviço está temporariamente indisponível.");
  }

  let response: Response;
  try {
    response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/v1/leads`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      },
    );
  } catch {
    throw new LeadServiceError(
      "Não foi possível conectar ao servidor. Tente novamente em instantes.",
    );
  }

  if (response.ok) return;

  const body: unknown = await response.json().catch(() => null);
  const message =
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
      ? body.error
      : "Não foi possível enviar seus dados. Tente novamente.";

  throw new LeadServiceError(message, response.status);
}
