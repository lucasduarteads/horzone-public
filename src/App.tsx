import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

const DevelopmentApp = import.meta.env.DEV
  ? lazy(() => import("./DevelopmentApp"))
  : null;

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada.</h1>
    </main>
  );
}

export default function App() {
  const hostname = window.location.hostname;
  const isLocalDevelopment =
    import.meta.env.DEV &&
    (hostname === "localhost" || hostname === "127.0.0.1");
  const routes =
    isLocalDevelopment && DevelopmentApp ? (
      <Suspense fallback={<main className="min-h-screen" />}>
        <DevelopmentApp />
      </Suspense>
    ) : (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );

  return <BrowserRouter>{routes}</BrowserRouter>;
}
