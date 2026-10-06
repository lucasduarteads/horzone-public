import type { RefObject } from "react";
import Reveal from "./Reveal";

type HeaderProps = {
  audioMuted: boolean;
  topVideoRef: RefObject<HTMLVideoElement | null>;
  toggleAudio: () => void;
};

export default function Header({ audioMuted, topVideoRef, toggleAudio }: HeaderProps) {
  return (
    <header className="portfolio-header my-5 w-full lg:my-8">
      <Reveal>
        <div className="portfolio-avatar mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border border-slate-800">
          <img src="./img/perfil.png" alt="Letícia JPG" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Letícia JPG</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em]">UGC Creator</p>
      </Reveal>
      <Reveal>
        <nav aria-label="Redes sociais" className="portfolio-social-links flex w-full flex-wrap justify-center gap-3 px-2 py-6">
          {[
            ["instagram.png", "Instagram", "https://www.instagram.com/lettsss.jpg?stkn=MXRpNjFqajM4bWZnMw%3D%3D&utm_source=qr"],
            ["tiktok.png", "TikTok", "https://www.tiktok.com/@lettsss.jpg?_r=1&_t=ZS-99sMMWjcC7J"],
            ["gmail.png", "Email", "mailto:lets.jpg@gmail.com"],
            ["spotify.png", "Spotify", "https://open.spotify.com/user/312l7jaon4726nan6k6bdofo2lc4?si=NhQ7b8xpSgG-kC6YDmcQoQ&utm_source=copy-link&nd=1&dlsi=7b9f1f9dbaea4c8b"],
          ].map(([icon, label, url]) => (
            <a key={label} href={url} aria-label={label} title={label} target={url.startsWith("mailto:") ? undefined : "_blank"} rel={url.startsWith("mailto:") ? undefined : "noopener noreferrer"} className="flex items-center justify-center rounded-full border border-blue-500 bg-white/90 p-3.5 shadow-lg transition-transform active:scale-95">
              <img src={`./img/${icon}`} alt="" width="20" height="20" />
            </a>
          ))}
          <a href="https://wa.me/qr/GEGVWDDK4XMDP1" title="Agendar" target="_blank" rel="noopener noreferrer" className="flex min-w-24 items-center justify-center rounded-full border border-blue-500 bg-blue-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-95">Contato</a>
        </nav>
      </Reveal>
      <Reveal>
        <div className="portfolio-hero-video relative mx-auto mt-1 w-full max-w-3xl overflow-hidden rounded-xl bg-black">
          <video ref={topVideoRef} src="./midia/trem.mp4" autoPlay muted loop playsInline preload="auto" className="block w-full rounded-xl object-cover" />
          <button type="button" onClick={toggleAudio} aria-label={audioMuted ? "Ativar som" : "Desativar som"} className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
            <span aria-hidden="true">{audioMuted ? "🔇" : "🔊"}</span>{audioMuted ? "Ativar Som" : "Desativar Som"}
          </button>
        </div>
      </Reveal>
    </header>
  );
}
