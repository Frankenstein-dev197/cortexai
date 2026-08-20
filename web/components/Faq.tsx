const faqs = [
  {
    q: "What is Cortex AI?",
    a: "Cortex AI is an AI-native platform that unifies chat, document knowledge (RAG), and an agentic engineering workbench. You can ask questions over your data, then let agents plan, write, run, and verify real software — with a live preview of the result.",
  },
  {
    q: "What are credits and how are they consumed?",
    a: "Credits are the unit of work on Cortex. LLM calls, retrieval-augmented answers, agent runs, browser actions, sandbox execution, analysis, and builds each consume credits based on actual usage. Your balance and the cost of every operation are visible in your workspace.",
  },
  {
    q: "Which models does Cortex support?",
    a: "Cortex connects to major commercial and open model providers, as well as local models. You choose the default model per workspace, and the orchestrator can route specific tasks — like builds or analysis — to the model best suited for them.",
  },
  {
    q: "Is my code and data private?",
    a: "Yes. Workspaces are isolated with row-level security at the database layer, secrets never enter generated-code sandboxes, and every action is audit-logged. Self-hosted deployments keep everything on your own infrastructure.",
  },
  {
    q: "What can Cortex Build actually do?",
    a: "Given a goal like 'build me a SaaS app', Build plans the architecture, creates files, installs dependencies, runs the app in a sandbox, tests it in a real browser, fixes failures, and shows you a live preview. You stay in control with agent modes from Assist to Autonomous.",
  },
  {
    q: "Can I connect GitHub or GitLab?",
    a: "Yes. Connect via OAuth to clone repositories, read and edit code, create branches, commit, push, and open pull requests or merge requests directly from the workbench.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <p className="eyebrow">FAQ</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tightest text-bone">
        Questions, answered.
      </h2>
      <div className="mt-10 divide-y divide-white/[0.06]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-bone transition-colors hover:text-accent-soft [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="ml-4 font-mono text-ash transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ash">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
