import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

const ApplicationRoutes = lazy(() => import("./DevelopmentApp"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main className="min-h-screen" />}>
        <ApplicationRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
