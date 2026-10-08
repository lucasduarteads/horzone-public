import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { submitLead, warmLeadService } from "../services/leadService";

const services = [
  {
    number: "01",
    title: "Seu espaço digital",
    description:
      "Uma página profissional com sua identidade, biografia, redes sociais e os links mais importantes em um só lugar.",
    icon: "↗",
  },
  {
    number: "02",
    title: "Portfólio que apresenta",
    description:
      "Mostre vídeos, trabalhos e campanhas em uma vitrine pensada para marcas conhecerem o seu potencial.",
    icon: "◫",
  },
  {
    number: "03",
    title: "Compartilhe com facilidade",
    description:
      "Use um endereço simples para divulgar seu trabalho na bio das redes, em propostas e nas conversas com clientes.",
    icon: "⌁",
  },
];

const plans = [
  {
    name: "Essencial",
    price: "250",
    description: " LinkPage / ideal para direcionar leads.",
    features: [
      "Foto de perfil e bio profissional",
      "3 a 5 botões de links para redes sociais",
      "Cards clicáveis de até 3 serviços",
      "Opções de cores de fundo",
      "Botão flutuante de WhatsApp",
      "Página totalmente personalizada",
      "Seções estáticas",
    ],
  },
  {
    name: "Creator",
    price: "450",
    description:
      "BioWeb / Padrão Bio para transmitir autoridade e apresentar seus serviços.",
    features: [
      "Identidade visual alinhada",
      "Estrutura de marketing de vendas",
      "Botões de links para redes sociais",
      "Seção 'Sobre nós' com foto e texto",
      "Depoimentos de clientes",
      "Cards clicáveis de até 5 serviços",
      "Carrossel de banners / projetos",
      "Botão flutuante de WhatsApp",
      "Seções dinâmicas e animações",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "3800",
    description:
      "Página institucional Responsiva para desktop e mobile, ideal para profissionais que querem apresentar seu trabalho de forma completa.",
    features: [
      "Página com estrutura completa de marketing e vendas",
      "Seção 'Sobre nós' com foto e texto",
      "Carrossel de banners / projetos",
      "Catálogo de múltiplos serviços",
      "Depoimentos",
      "Seções dinâmicas e animações",
      "Botão flutuante de WhatsApp",
      "Formulário / Banco de leads",
      "Integração com métricas (Pixel / Analytics)",
      "Adicionais a combinar (consultoria, SEO, copywriting, etc.)",
    ],
  },
];

type ContactField = "name" | "email" | "phone" | "instagram" | "plan" | "message";
type ContactErrors = Partial<Record<ContactField, string>>;

const contactFields: ContactField[] = [
  "name",
  "email",
  "phone",
  "instagram",
  "plan",
  "message",
];

async function validateContactField(
  field: ContactField,
  value: string,
): Promise<string> {
  const trimmedValue = value.trim();

  switch (field) {
    case "name":
      if (trimmedValue.length < 2) return "Informe seu nome completo.";
      if (trimmedValue.length > 100) return "Use no máximo 100 caracteres.";
      return "";
    case "email":
      if (!trimmedValue) return "Informe seu e-mail.";
      if (trimmedValue.length > 254) return "Use no máximo 254 caracteres.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return "Informe um e-mail válido.";
      }
      return "";
    case "phone": {
      if (!trimmedValue) return "Informe seu WhatsApp com DDD.";
      if (trimmedValue.length > 30) return "Use no máximo 30 caracteres.";

      let parsePhoneNumberFromString: typeof import("libphonenumber-js/max")["parsePhoneNumberFromString"];
      try {
        ({ parsePhoneNumberFromString } = await import("libphonenumber-js/max"));
      } catch {
        return "Não foi possível carregar a validação telefônica. Tente novamente.";
      }

      try {
        const phoneNumber = parsePhoneNumberFromString(trimmedValue, {
          defaultCountry: "BR",
          extract: false,
        });
        if (!phoneNumber?.isValid() || phoneNumber.ext) {
          return "Informe um número com formato válido e DDD. No Brasil, use (11) 91234-5678.";
        }
      } catch {
        return "Informe um número válido para WhatsApp, com DDD.";
      }

      return "";
    }
    case "instagram":
      if (!trimmedValue) return "";
      if (trimmedValue.length > 200) return "Use no máximo 200 caracteres.";
      let isHttpUrl = false;
      try {
        const url = new URL(trimmedValue);
        isHttpUrl =
          ["http:", "https:"].includes(url.protocol) &&
          url.hostname.includes(".");
      } catch {
        isHttpUrl = false;
      }
      if (!/^@[a-z0-9._]{1,30}$/i.test(trimmedValue) && !isHttpUrl) {
        return "Informe @usuário ou um endereço iniciado por https://.";
      }
      return "";
    case "plan":
      if (
        trimmedValue &&
        !plans.some((plan) => plan.name === trimmedValue)
      ) {
        return "Selecione um plano válido.";
      }
      return "";
    case "message":
      if (trimmedValue.length < 5) {
        return "Conte um pouco mais (mínimo de 5 caracteres).";
      }
      if (trimmedValue.length > 2000) {
        return "Use no máximo 2000 caracteres.";
      }
      return "";
  }
}

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<ContactErrors>({});

  useEffect(() => {
    void warmLeadService().catch((error: unknown) => {
      console.warn("Não foi possível pré-aquecer a API de leads:", error);
    });
  }, []);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const preventRestrictedShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isRestrictedShortcut =
        (event.ctrlKey || event.metaKey) && ["c", "u", "s"].includes(key);

      if (isRestrictedShortcut || event.key === "F12") {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventRestrictedShortcuts);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventRestrictedShortcuts);
    };
  }, []);

  const prewarmLeadService = () => {
    void warmLeadService().catch((error: unknown) => {
      console.warn("Não foi possível pré-aquecer a API de leads:", error);
    });
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);

    const form = event.currentTarget;
    setFormFeedback(null);
    try {
      const formData = new FormData(form);
      const nextErrors: ContactErrors = {};
      await Promise.all(
        contactFields.map(async (field) => {
          const value =
            field === "plan"
              ? selectedPlan
              : String(formData.get(field) ?? "");
          const error = await validateContactField(field, value);
          if (error) nextErrors[field] = error;
        }),
      );

      setFormErrors(nextErrors);
      const firstInvalidField = contactFields.find((field) => nextErrors[field]);
      if (firstInvalidField) {
        const invalidElement = form.elements.namedItem(firstInvalidField);
        if (invalidElement instanceof HTMLElement) invalidElement.focus();
        return;
      }

      await submitLead({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        instagram:
          String(formData.get("instagram") ?? "").trim() || undefined,
        plan: selectedPlan || "Ainda quero conhecer",
        message: String(formData.get("message") ?? "").trim(),
      });
      form.reset();
      setSelectedPlan("");
      setFormErrors({});
      setFormFeedback({
        type: "success",
        message: "Recebemos seus dados! Em breve entraremos em contato.",
      });
    } catch (error) {
      setFormFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar seus dados. Tente novamente.",
      });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const validateFieldOnBlur = async (
    field: ContactField,
    value: string,
  ) => {
    if (value.length === 0) {
      setFormErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
      return;
    }

    const error = await validateContactField(field, value);
    setFormErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const clearFieldError = (field: ContactField) => {
    setFormFeedback(null);
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f6] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#faf9f6]/90 backdrop-blur-xl">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
        >
          <a href="/" aria-label="BioWeb, página inicial" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              b.
            </span>
            <span className="text-xl font-bold tracking-tight">bioweb</span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <button type="button" className="transition hover:text-indigo-700" onClick={() => scrollToSection("servicos")}>Serviços</button>
            <button type="button" className="transition hover:text-indigo-700" onClick={() => scrollToSection("planos")}>Planos</button>
            <button type="button" className="transition hover:text-indigo-700" onClick={() => scrollToSection("como-funciona")}>Como funciona</button>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection("contato")}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            Fale com a gente
          </button>
        </nav>
      </header>

      <section className="landing-hero relative isolate">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-28 -z-10 h-[32rem] w-[32rem] rounded-full bg-indigo-200/60 blur-3xl"
        />
        <div className="landing-hero-content mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24 xl:py-28">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Seu talento merece uma vitrine
            </p>
            <h1 className="landing-hero-title max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Sua carreira criativa,{" "}
              <span className="text-indigo-600">em um só link.</span>
            </h1>
            <p className="landing-hero-copy mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              A BioWeb reúne seu portfólio UGC, redes sociais e trabalhos em
              uma página profissional, fácil de compartilhar com marcas e
              clientes.
            </p>
            <div className="landing-hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection("planos")}
                className="rounded-full bg-indigo-600 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Conheça os planos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("servicos")}
                className="rounded-full border border-slate-300 bg-white/70 px-7 py-3.5 text-center text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-white"
              >
                Descubra a BioWeb
              </button>
              <a
                href="/portfolio-demo"
                className="rounded-full border border-indigo-200 bg-indigo-50 px-7 py-3.5 text-center text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
              >
                Ver demonstração
              </a>
            </div>
            <div className="landing-hero-proof mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-600">
              <span><strong className="text-slate-950">✓</strong> Feito para criadores</span>
              <span><strong className="text-slate-950">✓</strong> Fácil de compartilhar</span>
              <span><strong className="text-slate-950">✓</strong> Seu trabalho em destaque</span>
            </div>
          </div>

          <div className="landing-profile-preview relative mx-auto w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-gradient-to-br from-indigo-300 via-violet-200 to-rose-200 opacity-70 blur-sm"
            />
            <div className="landing-profile-card relative rounded-[2rem] border border-white/80 bg-white p-5 shadow-2xl shadow-indigo-950/15 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Seu perfil BioWeb</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Online</span>
              </div>
              <div className="landing-profile-summary mt-6 rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-50 to-rose-100 p-6 text-center">
                <div className="landing-profile-avatar mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-indigo-200 text-3xl shadow-md">✳</div>
                <p className="mt-4 text-lg font-bold text-slate-900">Seu nome criativo</p>
                <p className="mt-1 text-sm text-slate-600">Criadora UGC · Moda · Beleza</p>
                <div className="mt-5 flex justify-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm">◎</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm">♪</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm">↗</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-amber-100 to-rose-200 p-3">
                  <span className="flex h-full items-end rounded-lg bg-white/25 p-2 text-xs font-semibold text-slate-800">Seu conteúdo</span>
                </div>
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-sky-100 to-indigo-200 p-3">
                  <span className="flex h-full items-end rounded-lg bg-white/25 p-2 text-xs font-semibold text-slate-800">Seus trabalhos</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">
                Vamos criar algo incrível ↗
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs text-slate-500">Sua presença digital</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">com a sua identidade</p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="landing-fullscreen-section scroll-mt-0 bg-white py-12 sm:py-16 lg:py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Tudo conectado</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Uma vitrine, muitas possibilidades.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Apresente sua marca pessoal de um jeito organizado, bonito e pronto para compartilhar.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.number} className={`rounded-3xl border border-slate-200 bg-[#faf9f6] p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 ${service.number === "03" ? "md:col-span-2 md:mx-auto md:w-1/2 lg:col-span-1 lg:w-auto" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-2xl text-indigo-700">{service.icon}</span>
                  <span className="text-xs font-bold tracking-widest text-slate-400">{service.number}</span>
                </div>
                <h3 className="mt-7 text-xl font-bold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="landing-fullscreen-section scroll-mt-0 py-12 sm:py-16 lg:py-8">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Simples para começar</p>
            <h2 className="mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">Seu próximo passo profissional começa aqui.</h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Você escolhe um plano e compartilha suas informações. A BioWeb organiza sua presença digital para que seu trabalho seja visto e lembrado.
            </p>
            <button type="button" onClick={() => scrollToSection("contato")} className="mt-7 inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900">
              Quero conversar sobre meu perfil <span aria-hidden="true">→</span>
            </button>
          </div>
          <ol className="space-y-4">
            {[
              ["01", "Escolha o plano ideal", "Encontre o formato que combina com o momento da sua carreira."],
              ["02", "Conte sua história", "Compartilhe seus links, sua bio e os trabalhos que quer destacar."],
              ["03", "Divulgue seu perfil", "Envie seu link para marcas, clientes e para a bio das suas redes."],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{number}</span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="planos" className="landing-fullscreen-section landing-plan-section scroll-mt-0 bg-slate-950 py-12 text-white sm:py-16 lg:py-8">
        <div className="landing-plan-content mx-auto max-w-7xl px-5 sm:px-8">
          <div className="landing-plan-intro mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Valores por projeto</p>
            <h2 className="landing-plan-title mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Escolha como quer aparecer.</h2>
            <p className="landing-plan-subtitle mt-4 leading-7 text-slate-300">Comece com o essencial e evolua junto com a sua carreira.</p>
          </div>
          
          <div className="landing-plan-grid mt-10 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className={`landing-plan-card relative flex min-w-0 flex-col rounded-3xl border p-6 sm:p-8 ${plan.featured ? "border-indigo-400 bg-indigo-950 shadow-2xl shadow-indigo-950/50 lg:-my-3" : "border-white/10 bg-white/[0.04]"}`}>
                {plan.featured && <span className="landing-plan-badge absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-400 px-4 py-1 text-xs font-bold text-slate-950">MAIS ESCOLHIDO</span>}
                <h3 className="landing-plan-name text-xl font-bold">{plan.name}</h3>
                <p className="landing-plan-description mt-2 min-h-12 text-sm leading-6 text-slate-300">{plan.description}</p>
                <p className="landing-plan-price mt-6">
                  <span className="text-sm text-slate-300">R$</span>{" "}
                  <span className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl">{plan.price}</span>
                  <span className="ml-1 text-sm text-slate-300">por projeto</span>
                </p>
                <ul className="landing-plan-features mt-7 flex-1 space-y-3 border-t border-white/10 pt-6 text-sm text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="font-bold text-emerald-300">✓</span>{feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    scrollToSection("contato");
                  }}
                  className={`landing-plan-cta mt-8 block rounded-full px-5 py-3 text-center text-sm font-bold transition hover:-translate-y-0.5 ${plan.featured ? "bg-white text-indigo-950 hover:bg-indigo-100" : "border border-white/20 text-white hover:bg-white/10"}`}
                >
                  Tenho interesse
                </button>
              </article>
            ))}
          </div>
          <p className="landing-plan-footnote mt-5 text-center text-xs text-slate-400">* Preços ilustrativos, sujeitos a alteração. Contratação e cobrança ainda não estão habilitadas.</p>
        </div>
      </section>

      <section className="landing-fullscreen-section scroll-mt-0 bg-white py-12 sm:py-16 lg:py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Mais do que um link</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Benefícios para transformar visitas em contatos.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-[#faf9f6] p-7">
              <h3 className="text-xl font-bold">Experiência de aplicativo</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Mobile-first e feita para abrir rapidamente dentro do navegador do Instagram ou TikTok, sem redirecionar por links externos lentos.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-[#faf9f6] p-7">
              <h3 className="text-xl font-bold">Apresentação visual completa</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                O carrossel valoriza seu portfólio, provas sociais ou fotos de produtos e ajuda a manter o visitante interessado por mais tempo.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-[#faf9f6] p-7">
              <h3 className="text-xl font-bold">Contato bem organizado</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Diferentes botões podem direcionar o cliente à mensagem certa no WhatsApp, como “Olá, vi o serviço X no link da bio”.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="contato" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Vamos conversar</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Sua próxima oportunidade pode começar com um link.</h2>
            <p className="mt-5 leading-7 text-slate-600">
              Deixe seus dados e conte o que você precisa. Nossa equipe entrará em contato em breve.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} onFocusCapture={prewarmLeadService} aria-busy={isSubmitting} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Seu nome
                <input id="contact-name" required name="name" autoComplete="name" minLength={2} maxLength={100} aria-invalid={Boolean(formErrors.name)} aria-describedby={formErrors.name ? "contact-name-error" : undefined} onBlur={(event) => validateFieldOnBlur("name", event.currentTarget.value)} onChange={() => clearFieldError("name")} className={`mt-2 w-full rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`} placeholder="Como podemos te chamar?" />
                {formErrors.name && <span id="contact-name-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.name}</span>}
              </label>
              <label className="text-sm font-semibold text-slate-700">
                E-mail
                <input id="contact-email" required name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={Boolean(formErrors.email)} aria-describedby={formErrors.email ? "contact-email-error" : undefined} onBlur={(event) => validateFieldOnBlur("email", event.currentTarget.value)} onChange={() => clearFieldError("email")} className={`mt-2 w-full rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`} placeholder="voce@email.com" />
                {formErrors.email && <span id="contact-email-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.email}</span>}
              </label>
              <label className="text-sm font-semibold text-slate-700">
                WhatsApp
                <input id="contact-whatsapp" required name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} aria-invalid={Boolean(formErrors.phone)} aria-describedby={formErrors.phone ? "contact-whatsapp-error" : undefined} onBlur={(event) => validateFieldOnBlur("phone", event.currentTarget.value)} onChange={() => clearFieldError("phone")} className={`mt-2 w-full rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`} placeholder="(11) 99999-9999" />
                {formErrors.phone && <span id="contact-whatsapp-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.phone}</span>}
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Instagram ou portfólio (opcional)
              <input id="contact-social" name="instagram" maxLength={200} aria-invalid={Boolean(formErrors.instagram)} aria-describedby={formErrors.instagram ? "contact-social-error" : undefined} onBlur={(event) => validateFieldOnBlur("instagram", event.currentTarget.value)} onChange={() => clearFieldError("instagram")} className={`mt-2 w-full rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.instagram ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`} placeholder="@seuperfil ou link https://" />
              {formErrors.instagram && <span id="contact-social-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.instagram}</span>}
            </label>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Plano de interesse
              <select id="contact-plan" name="plan" value={selectedPlan} aria-invalid={Boolean(formErrors.plan)} aria-describedby={formErrors.plan ? "contact-plan-error" : undefined} onBlur={(event) => validateFieldOnBlur("plan", event.currentTarget.value)} onChange={(event) => { setSelectedPlan(event.target.value); clearFieldError("plan"); }} className={`mt-2 w-full rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.plan ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`}>
                <option value="">Ainda quero conhecer</option>
                {plans.map((plan) => <option key={plan.name} value={plan.name}>{plan.name}</option>)}
              </select>
              {formErrors.plan && <span id="contact-plan-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.plan}</span>}
            </label>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              O que você gostaria de criar?
              <textarea id="contact-message" required name="message" rows={4} minLength={5} maxLength={2000} aria-invalid={Boolean(formErrors.message)} aria-describedby={formErrors.message ? "contact-message-error" : undefined} onBlur={(event) => validateFieldOnBlur("message", event.currentTarget.value)} onChange={() => clearFieldError("message")} className={`mt-2 w-full resize-y rounded-xl border bg-[#faf9f6] px-4 py-3 text-base font-normal outline-none transition focus:ring-4 md:text-sm ${formErrors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10"}`} placeholder="Conte um pouco sobre você e seu trabalho..." />
              {formErrors.message && <span id="contact-message-error" className="mt-1 block text-xs font-medium text-red-600">{formErrors.message}</span>}
            </label>
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting && (
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-3px]"
                />
              )}
              {isSubmitting ? "Enviando..." : "Enviar interesse"}
            </button>
            <div className="mt-3 flex min-h-10 items-center justify-center">
              {isSubmitting && (
                <p
                  role="status"
                  className="inline-flex items-center gap-2 text-center text-sm text-slate-600"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0 animate-bounce text-indigo-600"
                  >
                    <path d="M12 19v3" />
                    <path d="M12 15.5 8.5 19l-1.5-1.5L9 12l-5-4 1-2 7 2 7-2 1 2-5 4 2 5.5-1.5 1.5L12 15.5Z" />
                    <path d="M12 2v2" />
                  </svg>
                  <span>A conectar ao servidor e a enviar mensagem...</span>
                </p>
              )}
            </div>
            {formFeedback && (
              <p
                role={formFeedback.type === "error" ? "alert" : "status"}
                className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${
                  formFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900"
                    : "bg-red-50 text-red-900"
                }`}
              >
                {formFeedback.message}
              </p>
            )}
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500">
        <p><span className="font-bold text-slate-900">bioweb</span> · Sua presença digital, do seu jeito.</p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} Horzone</p>
      </footer>
    </main>
  );
}
