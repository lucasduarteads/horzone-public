import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Carousel from "./components/Carousel";
import Header from "./components/Header";
import Reveal from "./components/Reveal";
import VideoCard from "./components/VideoCard";
import LandingPage from "./pages/LandingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LoginPage from "./pages/LoginPage";

type Coupon = {
  brand: string;
  category: string;
  code: string;
  store?: string;
  color: string;
};

const photos = ["lets.png", "lets2.png", "lets3.png", "lets4.png"];
const feedbacks = [
  ["IMG_1376.PNG", "c.fidelliz"],
  ["IMG_1377.PNG", "julianacarreirointeriores"],
  ["IMG_1378.PNG", "jhefraganails"],
  ["IMG_1379.PNG", "falcatrue"],
  ["IMG_1380.PNG", "marcos.vy"],
  ["IMG_1381.PNG", "midorisawaki_"],
  ["IMG_1382.PNG", "matheusssolvrrr"],
  ["IMG_1383.PNG", "amandaatenorio"],
  ["IMG_1384.PNG", "carolinenascci"],
  ["IMG_1385.PNG", "carolinenascci"],
];

const works = [
  ["video1.mp4", "campo.PNG", "Coleção Retrô", "Curadoria de peças clássicas"],
  ["video2.mp4", "mac.PNG", "Provador Vintage", "Looks completos e combinações"],
  ["video3.mp4", "cabelo.PNG", "Bastidores & Cuidado", "Higienização e restauração"],
  ["video4.mp4", "oculos.PNG", "Novidades da Semana", "Confira os novos garimpos"],
];

const coupons: Coupon[] = [
  { brand: "TEEVA", category: "Vestuário", code: "TEEVALETICIA94", store: "https://teevaofficial.com?bg_ref=kiRRBJjnQm", color: "indigo" },
  { brand: "URBAN FLOWERS", category: "Sapatos & Moda", code: "LETTSSS", color: "emerald" },
  { brand: "TUYO", category: "Acessórios", code: "LETS10", store: "https://tuyo.com.br/?srsltid=AfmBOopjJylvfAAyIJz7B5jTJGTgokVNqAOL9vnsas496hMPTo1Qa7hi", color: "purple" },
  { brand: "MEU SAPATO PRETO", category: "Calçados", code: "LELE", store: "https://www.meusapatopreto.com.br", color: "rose" },
  { brand: "USE HITZZ", category: "Moda", code: "LELE", store: "https://www.usehitzz.com.br/?srsltid=AfmBOopAsgXMKt84pntro64A_poDIO4kDzYIlzv93RDl6XRHRmzEaY13", color: "amber" },
  { brand: "TODA UP", category: "Moda Fitness", code: "LET", store: "https://todaup.com/collections/squad-toda-up?utm_campaign=fluxoinfluenciadoras&utm_content=mensagem1&utm_medium=influs&utm_source=influs&utm_term=comissao", color: "sky" },
  { brand: "LINUS", category: "Sandálias Ecológicas", code: "LELE10", store: "https://uselinus.com.br/collections/sandalia-linus-colecao-completa?srsltid=AfmBOoqQBL0yuP8_254Q8lwxDAnzt9Gry-buVuJrxttwVjreKDcFhloj", color: "teal" },
  { brand: "BIFFLES", category: "Alimentação", code: "LET05", store: "https://biffles.saipos.com/home", color: "orange" },
  { brand: "ÓTICAS PREVENT", category: "Óculos & Lentes", code: "INFLUENCER15", store: "https://lp.oticasprevent.com.br/influencer/?utm_source=Influencer&utm_medium=stories&utm_campaign=letss+jpg", color: "cyan" },
];

const categoryStyles: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  purple: "bg-purple-50 text-purple-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  teal: "bg-teal-50 text-teal-700",
  orange: "bg-orange-50 text-orange-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`mb-4 w-full py-4 text-center text-2xl font-semibold text-slate-800 ${className}`}>{children}</h2>;
}

function FeedbackGallery() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(() => new Set());
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [cardDelays, setCardDelays] = useState<Map<number, number>>(() => new Map());
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let currentDirection: "down" | "up" = "down";
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY !== previousScrollY) {
        const nextDirection = currentScrollY > previousScrollY ? "down" : "up";
        if (nextDirection !== currentDirection) {
          currentDirection = nextDirection;
          setScrollDirection(nextDirection);
        }
        previousScrollY = currentScrollY;
      }
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    if (!("IntersectionObserver" in window)) {
      setVisibleCards(new Set(feedbacks.map((_, index) => index)));
      setCardDelays(new Map(feedbacks.map((_, index) => [index, index * 65])));
      return () => window.removeEventListener("scroll", updateScrollDirection);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const orderedEntries = [...entries].sort((first, second) => (
          currentDirection === "down"
            ? first.boundingClientRect.top - second.boundingClientRect.top
            : second.boundingClientRect.top - first.boundingClientRect.top
        ));
        const delays = new Map<number, number>();

        orderedEntries.forEach((entry, order) => {
          const index = Number((entry.target as HTMLDivElement).dataset.index);
          if (!Number.isInteger(index)) return;
          delays.set(index, order * 65);

          if (entry.isIntersecting) {
            setVisibleCards((current) => new Set(current).add(index));
          } else {
            setVisibleCards((current) => {
              if (!current.has(index)) return current;
              const next = new Set(current);
              next.delete(index);
              return next;
            });
          }
        });

        setCardDelays((current) => new Map([...current, ...delays]));
      },
      { threshold: 0.15, rootMargin: "0px 0px -24px 0px" },
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="feedback-gallery grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-4" data-scroll-direction={scrollDirection}>
      {feedbacks.map(([image, name], index) => (
        <div
          key={image}
          ref={(element) => { cardsRef.current[index] = element; }}
          data-index={index}
          className={`feedback-card overflow-hidden rounded-xl border border-white/80 bg-white/90 shadow-lg ${visibleCards.has(index) ? "is-visible" : ""}`}
          style={{ transitionDelay: `${cardDelays.get(index) ?? 0}ms` }}
        >
          <img src={`./img/${image}`} alt={`Comentário ${name}`} width="500" height="120" className="block h-auto w-full" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function Portfolio() {
  const [audioMuted, setAudioMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const topVideoRef = useRef<HTMLVideoElement>(null);
  const workVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const manualMuteRef = useRef(false);

  useEffect(() => {
    if (selectedPhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPhoto(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPhoto]);

  useEffect(() => {
    let ticking = false;
    const update = (handleAudio = false) => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
      const video = topVideoRef.current;
      if (handleAudio && video && window.scrollY > 150 && !video.muted) {
        video.muted = true;
        setAudioMuted(true);
      } else if (handleAudio && video && window.scrollY <= 50 && video.muted && !manualMuteRef.current) {
        video.muted = false;
        setAudioMuted(false);
        void video.play().catch(() => {
          video.muted = true;
          setAudioMuted(true);
        });
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => update(true));
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleAudio = () => {
    const video = topVideoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    manualMuteRef.current = video.muted;
    setAudioMuted(video.muted);
  };

  const toggleWorkVideo = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    const clickedVideo = workVideoRefs.current[index];
    if (!clickedVideo) return;
    if (activeVideo === index) {
      clickedVideo.pause();
      setActiveVideo(null);
      return;
    }
    workVideoRefs.current.forEach((video) => video?.pause());
    setActiveVideo(null);
    void clickedVideo.play().then(() => setActiveVideo(index)).catch(() => setActiveVideo(null));
  };

  return (
    <main className="portfolio-page w-full text-center">
      <div aria-hidden="true" className="fixed left-0 top-0 z-50 h-1 w-full bg-white/20">
        <div className="scroll-progress-bar h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 shadow-[0_0_10px_rgba(239,68,68,.5)]" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="mx-auto flex w-full max-w-[552px] flex-col items-center px-4 text-center sm:max-w-2xl sm:px-6 md:max-w-3xl lg:max-w-4xl lg:px-8 xl:max-w-5xl 2xl:max-w-6xl">
        <Header audioMuted={audioMuted} topVideoRef={topVideoRef} toggleAudio={toggleAudio} />

        <Reveal className="w-full">
          <Carousel />
        </Reveal>

        <Reveal className="mb-8 w-full py-6">
          <a href="./voucher.html" className="mx-auto flex w-full flex-col items-center justify-center rounded-2xl border border-blue-500 bg-white/90 px-2 py-4 text-slate-800 shadow-md transition hover:-translate-y-0.5 active:bg-blue-500 active:text-white md:max-w-md">
            <img src="./img/voucher.png" width="50" alt="" className="mb-1.5" loading="lazy" />
            <span className="text-base font-bold">Cupons de Descontos</span>
          </a>
        </Reveal>

        <Reveal className="mb-8 flex w-full flex-col gap-4 rounded-2xl border border-blue-500 bg-white/90 p-4 text-left shadow-lg md:grid md:grid-cols-2 md:items-center md:gap-x-6 md:gap-y-2 md:p-6 lg:gap-x-10 lg:p-8">
          <SectionHeading className="md:col-span-2">Sobre Mim</SectionHeading>
          <div className="relative h-[220px] overflow-hidden rounded-xl border border-blue-100 sm:h-[280px] md:h-full md:min-h-[300px] lg:min-h-[360px]">
            <img src="./img/perfillets.svg" alt="Sobre Letícia" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5">
              {["Curadoria Especial", "Moda Consciente"].map((badge) => <span key={badge} className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">{badge}</span>)}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold text-slate-800 lg:text-xl">Consciência, Estilo & História</h3>
            <p className="mb-3 text-[13px] leading-relaxed lg:text-sm">"Desde muito nova, a fotografia sempre me fez brilhar os olhos. Mesmo sem atuar na minha área de formação, a vida já tinha traçado caminhos voltados para o audiovisual. Sempre fui muito tímida, mas ao começar a criar conteúdo, percebi que havia um potencial escondido exatamente atrás dessa timidez.</p>
            <p className="text-[13px] leading-relaxed lg:text-sm">Hoje, além do audiovisual e da arquitetura/design, a moda também caminha ao meu lado — é através dela que expresso visualmente a minha personalidade e os meus gostos. Arquitetura, moda e audiovisual são os três pilares que definem a minha essência e a forma como enxergo o mundo e o dia a dia."</p>
          </div>
        </Reveal>

        <section className="flex w-full flex-col items-center">
          <SectionHeading>A influenciável</SectionHeading>
          <Reveal className="mb-8 grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {photos.map((photo, index) => (
              <button key={photo} type="button" onClick={() => setSelectedPhoto(index)} aria-label={`Ampliar foto ${index + 1}`} className="aspect-[3/4] overflow-hidden rounded-2xl border border-blue-500 bg-white/90 shadow-md transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:scale-95">
                <img src={`./img/${photo}`} alt={`Persona UGC ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </Reveal>
        </section>

        {selectedPhoto !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Foto ampliada ${selectedPhoto + 1}`}
              className="relative flex max-h-full max-w-full items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Fechar foto ampliada"
                className="absolute -right-2 -top-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-2xl font-semibold text-slate-900 shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-4 sm:-top-4"
              >
                ×
              </button>
              <img
                src={`./img/${photos[selectedPhoto]}`}
                alt={`Persona UGC ${selectedPhoto + 1}`}
                className="max-h-[85dvh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        )}

        <section className="mb-8 flex w-full flex-col items-center">
          <SectionHeading>Avaliações & Feedbacks</SectionHeading>
          <Reveal className="w-full">
            <FeedbackGallery />
          </Reveal>
        </section>

        <section className="flex w-full flex-col items-center">
          <SectionHeading>Takes Creator</SectionHeading>
          <Reveal className="mb-8 grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {works.map(([video, poster, title, subtitle], index) => (
              <VideoCard
                key={video}
                video={video}
                poster={poster}
                title={title}
                subtitle={subtitle}
                index={index}
                active={activeVideo === index}
                videoRef={(element) => { workVideoRefs.current[index] = element; }}
                onToggle={toggleWorkVideo}
              />
            ))}
          </Reveal>
        </section>

        <section className="flex w-full flex-col items-center">
          <SectionHeading>Contato</SectionHeading>
          <Reveal className="w-full">
            <p className="text-sm leading-relaxed">Entre em contato via E-mail ou Whatsapp para parcerias, colaborações ou qualquer outra consulta.</p>
            <div className="my-5 flex flex-col items-center">
              <img src="./img/perfillets.svg" alt="Letícia JPG" className="contact-floating-logo h-16 w-16 rounded-full object-cover" loading="lazy" />
              <p className="mt-2">Bjuu!</p>
            </div>
          </Reveal>
        </section>
      </div>

      <footer className="flex w-full flex-col items-center gap-1 bg-gradient-to-t from-blue-300/70 via-blue-100/40 to-transparent px-4 py-8 text-xs text-slate-700 sm:py-10">
        <img src="./img/logo.svg" alt="Horzone" width="40" height="40" />
        <p className="font-bold">Horzone tecnologia</p>
        <span className="text-[10px]">Direitos reservados</span>
      </footer>
    </main>
  );
}

function CouponPage() {
  const [toast, setToast] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setToast(`Cupom "${code}" copiado!`);
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      copiedTimeout.current = setTimeout(() => setCopiedCode(""), 2000);
      toastTimeout.current = setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Falha ao copiar o cupom:", error);
      setToast("Erro ao copiar. Tente selecionar o texto manualmente.");
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center">
          <a href="./" className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">← Voltar ao portfólio</a>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Códigos de Desconto</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Aproveite cupons e links exclusivos das minhas marcas parceiras</p>
        </div>
      </header>
      <div className={`fixed bottom-5 right-5 z-50 flex max-w-[calc(100%-2.5rem)] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`} role="status" aria-live="polite">
        <span aria-hidden="true" className="text-emerald-400">✓</span>
        <span className="text-sm font-medium">{toast}</span>
      </div>
      <section aria-label="Cupons disponíveis" className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:px-8">
        {coupons.map((coupon) => (
          <article key={coupon.brand} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${categoryStyles[coupon.color]}`}>{coupon.category}</span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{coupon.brand}</h2>
            </div>
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5">
                <span className="select-all font-mono text-sm font-bold tracking-wider text-slate-700 sm:text-base">{coupon.code}</span>
                <button type="button" onClick={() => void copyCode(coupon.code)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${copiedCode === coupon.code ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                  <span aria-hidden="true">{copiedCode === coupon.code ? "✓" : "▢"}</span>{copiedCode === coupon.code ? "Copiado!" : "Copiar Cupom"}
                </button>
              </div>
              {coupon.store ? (
                <a href={coupon.store} target="_blank" rel="noopener noreferrer" className="block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800">
                  Ir para a Loja <span aria-hidden="true" className="ml-1 text-xs">↗</span>
                </a>
              ) : (
                <span className="block w-full cursor-not-allowed rounded-xl bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-400">Link indisponível</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default function DevelopmentApp() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing Page e Páginas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/voucher.html" element={<CouponPage />} />
        <Route path="/portfolio-demo" element={<Portfolio />} />
        <Route path="/leticiajpg" element={<Portfolio />} />

        {/* Autenticação e Painel */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<PrivateRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Route>

        {/* Redirecionamento amigável para tentativas alternativas de login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Rota Fallback (Página Não Encontrada) */}
        <Route
          path="*"
          element={
            <main className="grid min-h-screen place-items-center px-6 text-center">
              <h1 className="text-2xl font-bold">Página não encontrada.</h1>
            </main>
          }
        />
      </Routes>
    </AuthProvider>
  );
}