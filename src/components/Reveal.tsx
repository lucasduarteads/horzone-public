import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let previousScrollY = window.scrollY;
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === previousScrollY) return;
      element.dataset.scrollDirection = currentScrollY > previousScrollY ? "down" : "up";
      previousScrollY = currentScrollY;
    };

    element.dataset.scrollDirection = "down";
    window.addEventListener("scroll", updateScrollDirection, { passive: true });

    if (!("IntersectionObserver" in window)) {
      element.classList.add("visible");
      return () => window.removeEventListener("scroll", updateScrollDirection);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        element.classList.toggle("visible", entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px 0px -20px 0px" },
    );
    observer.observe(element);
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
      observer.disconnect();
    };
  }, []);

  return <div ref={elementRef} className={`reveal ${className}`}>{children}</div>;
}
