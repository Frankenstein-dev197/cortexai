const files = [
  { name: "app/", depth: 0 },
  { name: "page.tsx", depth: 1 },
  { name: "layout.tsx", depth: 1 },
  { name: "api/chat/route.ts", depth: 1 },
  { name: "components/", depth: 0 },
  { name: "Chat.tsx", depth: 1 },
  { name: "Composer.tsx", depth: 1 },
];

export function ProductVisual() {
  return (
    <div className="panel overflow-hidden shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-carbon px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="ml-3 font-mono text-[11px] text-ash">
          cortex — workbench
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent-soft">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
          agent running
        </span>
      </div>
      <div className="grid grid-cols-[180px_1fr] sm:grid-cols-[200px_1fr_220px]">
        {/* file tree */}
        <div className="hidden border-r border-white/[0.06] p-3 sm:block">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ash/60">
            Explorer
          </p>
          <ul className="space-y-1 font-mono text-[11px] text-ash">
            {files.map((f) => (
              <li
                key={f.name}
                style={{ paddingLeft: `${f.depth * 12}px` }}
                className={f.depth > 0 ? "text-bone/70" : "text-ash"}
              >
                {f.name}
              </li>
            ))}
          </ul>
        </div>
        {/* chat */}
        <div className="flex flex-col gap-3 p-4">
          <div className="max-w-[85%] self-end rounded-lg rounded-br-sm bg-slate2 px-3 py-2 text-[12px] leading-relaxed text-bone/90">
            Add a /api/chat route that streams responses and wire it to the
            composer.
          </div>
          <div className="max-w-[90%] rounded-lg rounded-bl-sm border border-white/[0.06] bg-graphite px-3 py-2">
            <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] text-accent-soft">
              ● cortex · agent mode
            </p>
            <p className="text-[12px] leading-relaxed text-bone/80">
              Created <span className="font-mono text-accent-soft">route.ts</span>{" "}
              with a streaming handler, updated the composer, and verified the
              build. All checks pass.
            </p>
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-lg border border-white/[0.08] bg-carbon px-3 py-2.5">
            <span className="text-[12px] text-ash/60">
              Ask Cortex anything…
            </span>
            <span className="ml-auto h-3.5 w-px animate-pulse-soft bg-accent" />
          </div>
        </div>
        {/* terminal */}
        <div className="hidden border-l border-white/[0.06] bg-carbon p-3 font-mono text-[10px] leading-5 text-ash sm:block">
          <p className="text-ash/60">$ npm run build</p>
          <p>▲ cortex-ai-web</p>
          <p>✓ compiled successfully</p>
          <p>✓ lint passed</p>
          <p className="text-bone/70">✓ preview live :3000</p>
        </div>
      </div>
    </div>
  );
}
