import { ArrowRight } from "lucide-react";
import { links } from "@/lib/config";
import { CortexLogo } from "./Logo";

export function CtaFooter() {
  return (
    <>
      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <div className="glow-accent absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
          <h2 className="text-gradient mx-auto max-w-2xl text-4xl font-semibold tracking-tightest sm:text-5xl">
            Start building with intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ash">
            Create your workspace in seconds. Bring your documents, your
            repositories, and your ideas — Cortex takes it from there.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a href={links.signup} className="btn-primary">
              Start Building
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={links.login} className="btn-secondary">
              Sign in
            </a>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/[0.06] bg-carbon">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <CortexLogo />
            <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer">
              <a href="#product" className="text-xs text-ash transition-colors hover:text-bone">Product</a>
              <a href="#agents" className="text-xs text-ash transition-colors hover:text-bone">Agents</a>
              <a href="#knowledge" className="text-xs text-ash transition-colors hover:text-bone">Knowledge</a>
              <a href="#pricing" className="text-xs text-ash transition-colors hover:text-bone">Pricing</a>
              <a href={links.github} className="text-xs text-ash transition-colors hover:text-bone">GitHub</a>
            </nav>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-ash/60 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Cortex AI. Build with intelligence.</p>
            <p>
              Built on the{" "}
              <a
                href="https://github.com/Mintplex-Labs/anything-llm"
                className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-bone"
              >
                AnythingLLM
              </a>{" "}
              foundation (MIT).
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
