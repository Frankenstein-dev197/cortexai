import { CircleDot } from "lucide-react";

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-y-3">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center">
          <span className="rounded-md border border-white/[0.08] bg-carbon px-2.5 py-1 font-mono text-[11px] text-bone/80">
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="mx-2 font-mono text-[11px] text-accent">→</span>
          )}
        </li>
      ))}
    </ol>
  );
}

const modes = [
  {
    name: "Ask",
    body: "Direct answers from models and your knowledge base. No side effects.",
  },
  {
    name: "Assist",
    body: "Cortex drafts edits and commands, you approve each step before it runs.",
  },
  {
    name: "Agent",
    body: "Cortex plans and executes multi-step work with tools, checking in at milestones.",
  },
  {
    name: "Autonomous",
    body: "Full loop: plan, build, run, test, fix, verify — within sandbox limits you define.",
  },
];

export function Pipelines() {
  return (
    <section id="agents" className="border-y border-white/[0.06] bg-carbon/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Cortex Orchestrator</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tightest text-bone">
              Agents with real control.
            </h2>
            <p className="mt-4 leading-relaxed text-ash">
              The orchestrator decides which model, which agent, and which
              tools each task needs — then drives the loop: user → model →
              agent → tools → runtime → result.
            </p>
            <Flow
              steps={["USER", "CORTEX", "MODEL", "AGENT", "TOOLS", "RUNTIME", "RESULT"]}
            />
            <ul className="mt-8 space-y-4">
              {modes.map((m) => (
                <li key={m.name} className="flex gap-3">
                  <CircleDot
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-bone">
                      {m.name}
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-ash">
                      {m.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-12">
            <div id="knowledge">
              <p className="eyebrow">Cortex Knowledge</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tightest text-bone">
                Documents in, cited answers out.
              </h3>
              <Flow
                steps={[
                  "UPLOAD",
                  "PROCESS",
                  "CHUNK",
                  "EMBED",
                  "INDEX",
                  "RETRIEVE",
                  "ANSWER",
                  "CITATION",
                ]}
              />
            </div>
            <div id="build">
              <p className="eyebrow">Cortex Build</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tightest text-bone">
                From prompt to verified software.
              </h3>
              <Flow
                steps={[
                  "UNDERSTAND",
                  "PLAN",
                  "CODE",
                  "INSTALL",
                  "RUN",
                  "TEST",
                  "FIX",
                  "VERIFY",
                  "PREVIEW",
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
