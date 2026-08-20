import { CortexLogo } from "./Logo";
import { links } from "@/lib/config";

const nav = [
  { label: "Product", href: "#product" },
  { label: "Agents", href: "#agents" },
  { label: "Knowledge", href: "#knowledge" },
  { label: "Build", href: "#build" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" aria-label="Cortex AI home">
          <CortexLogo />
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ash transition-colors hover:text-bone"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={links.login}
            className="hidden text-sm text-ash transition-colors hover:text-bone sm:block"
          >
            Sign in
          </a>
          <a
            href={links.signup}
            className="inline-flex h-9 items-center rounded-lg bg-bone px-4 text-sm font-semibold text-void transition-colors hover:bg-white"
          >
            Start Building
          </a>
        </div>
      </div>
    </header>
  );
}
