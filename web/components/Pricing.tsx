import { Check } from "lucide-react";
import { links } from "@/lib/config";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    body: "Explore Cortex with a monthly credit allowance.",
    credits: "100 credits / month",
    features: ["Chat & knowledge base", "1 workspace", "Community models", "Core agent modes"],
    highlight: false,
  },
  {
    name: "Starter",
    price: "$12",
    period: "per month",
    body: "For builders shipping their first projects.",
    credits: "1,000 credits / month",
    features: ["Everything in Free", "3 workspaces", "Cortex Build", "Live preview"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    body: "For professionals who build every day.",
    credits: "5,000 credits / month",
    features: ["Everything in Starter", "Autonomous mode", "Priority runtime", "Cortex Analyzer"],
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "per month",
    body: "Shared workspaces and pooled credits for teams.",
    credits: "20,000 credits / month",
    features: ["Everything in Pro", "10 seats included", "Shared knowledge", "Audit logs"],
    highlight: false,
  },
  {
    name: "Business",
    price: "Custom",
    period: "contact us",
    body: "SSO, dedicated sandboxes, and custom limits.",
    credits: "Custom credits",
    features: ["Everything in Team", "SSO & SCIM", "Dedicated runtime", "SLA & support"],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-white/[0.06] bg-carbon/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tightest text-bone sm:text-4xl">
          Credits that map to real work.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ash">
          LLM calls, retrieval, agent runs, browser actions, sandbox time, and
          builds consume credits. You always see what an operation costs.
        </p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`panel flex flex-col p-5 ${
                t.highlight
                  ? "border-accent/40 bg-accent/[0.06]"
                  : "panel-hover"
              }`}
            >
              <h3 className="text-sm font-semibold text-bone">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-bone">
                  {t.price}
                </span>
                <span className="text-xs text-ash">{t.period}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ash">{t.body}</p>
              <p className="mt-3 font-mono text-[11px] text-accent-soft">
                {t.credits}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ash">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent-soft" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={links.signup}
                className={`mt-5 inline-flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  t.highlight
                    ? "bg-accent text-white hover:bg-accent-deep"
                    : "border border-white/10 bg-white/[0.03] text-bone hover:bg-white/[0.06]"
                }`}
              >
                Get started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
