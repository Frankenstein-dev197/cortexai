import {
  MessageSquare,
  Bot,
  BookOpen,
  Hammer,
  ScanSearch,
  PanelsTopLeft,
  MonitorPlay,
  Activity,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Cortex Chat",
    body: "Streaming AI conversations over your workspaces, with citations, attachments, model selection, and full history.",
  },
  {
    icon: Bot,
    title: "Cortex Agents",
    body: "Four real agent modes — Ask, Assist, Agent, Autonomous — with pause, resume, stop, cancel, and retry controls.",
  },
  {
    icon: BookOpen,
    title: "Cortex Knowledge",
    body: "Upload PDFs, docs, code, and URLs. Cortex chunks, embeds, indexes, and answers with sources you can verify.",
  },
  {
    icon: Hammer,
    title: "Cortex Build",
    body: "Describe the software you want. Cortex plans, architects, writes the code, installs dependencies, runs, and tests it.",
  },
  {
    icon: ScanSearch,
    title: "Cortex Analyzer",
    body: "Deep analysis of code, architecture, dependencies, performance, and security — with explain, fix, and patch actions.",
  },
  {
    icon: PanelsTopLeft,
    title: "Cortex Workbench",
    body: "Explorer, Monaco editor, global search, terminal, Git, problems, and logs — a real engineering surface in the browser.",
  },
  {
    icon: MonitorPlay,
    title: "Live Preview",
    body: "Generated apps run in an isolated sandbox and stream to a live preview you can click, test, and verify.",
  },
  {
    icon: Activity,
    title: "Observability",
    body: "Every LLM call, agent run, tool call, retrieval, and build is traced. Token and credit usage stay visible.",
  },
];

export function Features() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-24">
      <p className="eyebrow">The platform</p>
      <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tightest text-bone sm:text-4xl">
        One surface for the entire intelligence loop.
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-ash">
        From a question about a PDF to a deployed application — Cortex carries
        context across chat, knowledge, agents, and the workbench so work
        compounds instead of resetting.
      </p>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="panel panel-hover p-5">
            <f.icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-semibold text-bone">{f.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ash">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
