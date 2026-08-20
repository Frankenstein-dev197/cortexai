import { ArrowRight, Terminal } from "lucide-react";
import { links } from "@/lib/config";
import { ProductVisual } from "./ProductVisual";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="glow-accent absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center sm:pt-32">
        <div className="animate-fade-up">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Now with Cortex Build — agentic software development
          </span>
        </div>
        <h1
          className="text-gradient mx-auto mt-8 max-w-4xl animate-fade-up text-5xl font-semibold tracking-tightest sm:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Build with intelligence.
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-ash"
          style={{ animationDelay: "160ms" }}
        >
          Cortex AI unifies chat, knowledge, and an agentic engineering
          workbench. Ask questions over your documents, let agents write and
          test real code, and preview the result — all in one black canvas.
        </p>
        <div
          className="mt-10 flex animate-fade-up items-center justify-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <a href={links.signup} className="btn-primary">
            Start Building
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#product" className="btn-secondary">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            Explore Cortex
          </a>
        </div>
        <div
          className="mt-16 animate-fade-up text-left"
          style={{ animationDelay: "320ms" }}
        >
          <ProductVisual />
        </div>
      </div>
    </section>
  );
}
