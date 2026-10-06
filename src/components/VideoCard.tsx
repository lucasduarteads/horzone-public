import type { MouseEvent } from "react";

export type VideoCardProps = {
  active: boolean;
  index: number;
  poster: string;
  subtitle: string;
  title: string;
  video: string;
  videoRef: (element: HTMLVideoElement | null) => void;
  onToggle: (event: MouseEvent<HTMLButtonElement>, index: number) => void;
};

export default function VideoCard({ active, index, poster, subtitle, title, video, videoRef, onToggle }: VideoCardProps) {
  return (
    <button type="button" onClick={(event) => onToggle(event, index)} aria-label={`${active ? "Pausar" : "Reproduzir"} ${title}`} aria-pressed={active} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-blue-500 bg-black text-left shadow-md">
      <video ref={videoRef} src={`./midia/${video}`} poster={`./img/${poster}`} playsInline loop preload="metadata" className="h-full w-full object-cover" />
      {!active && <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-3xl text-white backdrop-blur-sm">▶</span>}
      <span className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-3 pt-8 text-white">
        <span className="text-sm font-bold">{title}</span>
        <span className="mt-0.5 text-[11px]">{subtitle}</span>
      </span>
    </button>
  );
}
