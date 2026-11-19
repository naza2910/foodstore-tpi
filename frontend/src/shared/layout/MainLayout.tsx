import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared/layout/Navbar";
import { Toaster } from "@/shared/ui/Toaster";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        Food Store · TPI Programación 4 · UTN
      </footer>
      <Toaster />
    </div>
  );
}
