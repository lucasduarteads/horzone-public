const brands = [
  { name: "Cerave", logo: "cerave.png" },
  { name: "Coca Cola", logo: "coca-cola.svg" },
  { name: "Pantene", logo: "pantene.png", cropLogo: true },
  { name: "MAC Cosmetics", logo: "mac-cosmetics.webp" },
  { name: "Use Hittz", logo: "use-hittz.png", logoSurface: "bg-slate-950" },
  { name: "Meu Sapato Preto", logo: "meu-sapato-preto.svg" },
  { name: "Starbucks", logo: "starbucks.svg", logoSurface: "bg-emerald-800", invertLogo: true },
  { name: "CIF", logo: "cif.png" },
  { name: "Tuyo", logo: "tuyo.svg" },
  { name: "Óticas Prevent", logo: "oticas-prevent.webp" },
];

export default function Carousel() {
  return (
    <section aria-label="Ofertas das marcas parceiras" className="infinite-carousel-wrapper pointer-events-none relative -mx-4 mb-5 flex w-[calc(100%+2rem)] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="infinite-carousel-track flex gap-3">
        {[...brands, ...brands].map(({ name, logo, cropLogo, logoSurface, invertLogo }, index) => (
          <div key={`${name}-${index}`} role="img" aria-label={name} className="flex h-[3.75rem] w-32 shrink-0 items-center justify-center rounded-full border border-blue-500 bg-white/90 shadow">
            <span className={`flex h-9 w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-md p-1 ${logoSurface ?? "bg-white"}`}>
              <img
                src={`./img/brands/${logo}`}
                alt=""
                className={`max-h-full max-w-full object-contain ${cropLogo ? "h-full w-full object-cover" : ""} ${invertLogo ? "brightness-0 invert" : ""}`}
                loading="lazy"
              />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
