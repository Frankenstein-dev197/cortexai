import { Github, Gitlab, Globe, Database, ShieldCheck, Lock, Activity } from "lucide-react";

const integrations = [
  { icon: Github, name: "GitHub", body: "OAuth, repositories, branches, commits, pull requests, issues." },
  { icon: Gitlab, name: "GitLab", body: "Projects, merge requests, push and pull from the workbench." },
  { icon: Globe, name: "Browser Agent", body: "Open, click, type, scroll, navigate, inspect, test, verify." },
  { icon: Database, name: "Supabase", body: "Authentication, database, storage, and realtime as the backbone." },
];

const security = [
  { icon: ShieldCheck, title: "Sandboxed execution", body: "Generated code runs in isolated environments with timeouts, resource limits, and secret isolation — never in the Cortex process." },
  { icon: Lock, title: "Row-level security", body: "Workspace data is isolated at the database layer. User A can never read user B." },
  { icon: Activity, title: "Audit trail", body: "Requests, agent runs, tool calls, and deployments are logged and traceable." },
];

export function Integrations() {
  return (
    <section id="integrations" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Integrations</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tightest text-bone">
            Connected to where your work lives.
          </h2>
          <div className="mt-10 space-y-3">
            {integrations.map((i) => (
              <div key={i.name} className="panel panel-hover flex items-start gap-4 p-4">
                <i.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-bone">{i.name}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ash">{i.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div id="security">
          <p className="eyebrow">Security</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tightest text-bone">
            Built for enterprise trust.
          </h2>
          <div className="mt-10 space-y-3">
            {security.map((s) => (
              <div key={s.title} className="panel panel-hover flex items-start gap-4 p-4">
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-bone">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ash">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
