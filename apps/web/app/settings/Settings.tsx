"use client";
import { useRef, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { Card, PageHeader } from "@/components/ui";
import { Seg } from "@/components/Seg";

export function Settings() {
  const s = useStore((x) => x.settings);
  const attempts = useStore((x) => x.attempts.length);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const download = () => {
    const url = URL.createObjectURL(new Blob([actions.exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcc-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" kicker="Accessibility, display and your data" />
      <Card>
        <h2 className="font-semibold">Display</h2>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3"><span className="w-40 text-sm text-muted">Theme</span><Seg label="Theme" value={s.theme} onChange={(v) => actions.setSettings({ theme: v as "dark" | "light" | "system" })} options={[{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }, { id: "system", label: "System" }]} /></div>
          <div className="flex flex-wrap items-center gap-3"><span className="w-40 text-sm text-muted">Contrast</span><Seg label="Contrast" value={s.contrast} onChange={(v) => actions.setSettings({ contrast: v as "normal" | "high" })} options={[{ id: "normal", label: "Normal" }, { id: "high", label: "High" }]} /></div>
          <div className="flex flex-wrap items-center gap-3"><span className="w-40 text-sm text-muted">Text size</span><Seg label="Text size" value={String(s.fontScale)} onChange={(v) => actions.setSettings({ fontScale: Number(v) })} options={[{ id: "1", label: "100%" }, { id: "1.15", label: "115%" }, { id: "1.3", label: "130%" }]} /></div>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={s.reducedMotion} onChange={(e) => actions.setSettings({ reducedMotion: e.target.checked })} /> Reduce motion (also follows your system setting)</label>
          <div className="flex flex-wrap items-center gap-3"><span className="w-40 text-sm text-muted">Default explanation</span><Seg label="Explanation style" value={s.explanationMode} onChange={(v) => actions.setExplanationMode(v as "simple" | "formal" | "university")} options={[{ id: "simple", label: "Simple" }, { id: "formal", label: "Formal" }, { id: "university", label: "University" }]} /></div>
          <p className="text-sm text-muted">Language: English. Localisation hooks are planned; no machine-translated maths terms are shown.</p>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold">Your data</h2>
        <p className="mt-1 text-sm text-muted">Guest mode: everything ({attempts} answers, lesson positions, notes, notebook, exams) is stored only in this browser’s localStorage. Nothing is sent to a server, and there is no AI tutor or analytics in this build.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg border border-line px-3 py-2" onClick={download}>Export progress (JSON)</button>
          <button className="rounded-lg border border-line px-3 py-2" onClick={() => file.current?.click()}>Import progress</button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const r = actions.importJson(await f.text()); setMsg(r.ok ? "Imported." : r.error); }} />
          {!confirmDel ? <button className="rounded-lg border border-bad px-3 py-2 text-bad" onClick={() => setConfirmDel(true)}>Delete all my data…</button> : (
            <span className="flex items-center gap-2"><span className="text-sm">This cannot be undone.</span><button className="rounded-lg bg-bad px-3 py-2 font-semibold text-bg" onClick={() => { actions.deleteAll(); setConfirmDel(false); setMsg("All local data deleted."); }}>Yes, delete</button><button className="underline" onClick={() => setConfirmDel(false)}>Cancel</button></span>
          )}
        </div>
        {msg && <p role="status" className="mt-2 text-sm">{msg}</p>}
      </Card>
      <Card>
        <h2 className="font-semibold">Keyboard</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li><kbd>Tab</kbd> moves between controls; a “Skip to content” link appears first.</li>
          <li>Draggable points: focus with <kbd>Tab</kbd>, move with arrow keys (<kbd>Shift</kbd> for bigger steps).</li>
          <li>Zoomable graphs: focus the graph, <kbd>+</kbd>/<kbd>−</kbd> to zoom, <kbd>Shift</kbd>+arrows to pan.</li>
          <li>Every lab has a “Text and data alternative” section.</li>
        </ul>
      </Card>
    </div>
  );
}
