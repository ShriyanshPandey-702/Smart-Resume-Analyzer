import { FiDownload, FiCode, FiRotateCcw, FiAward } from "react-icons/fi";
import RadarChart from "./RadarChart";

const CMP_A = "var(--cmp-a)";
const CMP_B = "var(--cmp-b)";

function Section({ title, sub, children, className = "" }) {
  return (
    <section className={`card p-6 sm:p-7 ${className}`}>
      <header className="mb-5 pb-3 border-b border-[var(--hairline)]">
        <h3 className="font-display text-lg font-semibold text-[var(--ink)]">{title}</h3>
        {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function Chips({ items, tone }) {
  if (!items?.length) return <p className="text-sm text-[var(--faint)] italic">None</p>;
  const styles = {
    good: "bg-[color-mix(in_srgb,var(--score-strong)_14%,transparent)] text-[var(--score-strong)]",
    a: "text-white",
    b: "text-white",
    warn: "border border-dashed border-[var(--danger)] text-[var(--danger)]",
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k, i) => (
        <span
          key={i}
          className={`text-sm px-2.5 py-1 rounded-[var(--radius)] ${styles[tone] || ""}`}
          style={tone === "a" ? { background: CMP_A } : tone === "b" ? { background: CMP_B } : undefined}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function WinnerPill({ w }) {
  if (w === "A") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: CMP_A }}>A wins</span>;
  if (w === "B") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: CMP_B }}>B wins</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">Tie</span>;
}

export default function CompareResult({ data, fileA, fileB, onReset, onDownloadPdf, onDownloadJson }) {
  if (!data) return null;

  const scoreA = Math.round(data.resumeA?.atsScore ?? 0);
  const scoreB = Math.round(data.resumeB?.atsScore ?? 0);
  const winnerColor = data.winner === "A" ? CMP_A : data.winner === "B" ? CMP_B : "var(--muted)";
  const winnerLabel =
    data.winner === "A" ? "Resume A" : data.winner === "B" ? "Resume B" : "It's a tie";

  return (
    <div className="space-y-5 fade-in-up">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
        >
          <FiRotateCcw /> New comparison
        </button>
        <div className="flex gap-2">
          <button onClick={onDownloadJson} className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors">
            <FiCode /> JSON
          </button>
          <button onClick={onDownloadPdf} className="btn-accent flex items-center gap-2 px-5 py-2 font-semibold text-sm">
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* Overall winner */}
      <div className="card p-6 sm:p-8">
        <p className="eyebrow mb-5">Overall Winner</p>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${winnerColor} 16%, transparent)` }}>
                <FiAward className="w-5 h-5" style={{ color: winnerColor }} />
              </div>
              <p className="font-display text-3xl font-semibold" style={{ color: winnerColor }}>{winnerLabel}</p>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{data.verdict}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: fileA, tag: "Resume A", score: scoreA, color: CMP_A },
              { label: fileB, tag: "Resume B", score: scoreB, color: CMP_B },
            ].map((r) => (
              <div key={r.tag} className="rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--surface-2)] p-4">
                <p className="text-xs font-semibold" style={{ color: r.color }}>{r.tag}</p>
                <p className="text-[11px] text-[var(--faint)] truncate mb-2" title={r.label}>{r.label}</p>
                <p className="font-display text-3xl font-bold tabular-nums" style={{ color: r.color }}>{r.score}%</p>
                <div className="h-1.5 rounded-full bg-[var(--hairline)] mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: r.color }} />
                </div>
              </div>
            ))}
            <div className="rounded-[var(--radius)] border border-[var(--hairline)] p-4">
              <p className="eyebrow">Difference</p>
              <p className="font-display text-2xl font-bold mt-1 text-[var(--ink)]">+{data.scoreDifference ?? Math.abs(scoreA - scoreB)}%</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--hairline)] p-4">
              <p className="eyebrow">AI Confidence</p>
              <p className="font-display text-2xl font-bold mt-1 text-[var(--accent)]">{Math.round(data.aiConfidence ?? 0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Radar */}
      {data.radar?.length >= 3 && (
        <Section title="Category Radar" sub="Ten dimensions, both resumes overlaid.">
          <RadarChart axes={data.radar} labelA="Resume A" labelB="Resume B" />
        </Section>
      )}

      {/* Category comparison */}
      {data.categories?.length > 0 && (
        <Section title="Category Comparison" sub="Scored out of 10.">
          <div className="grid sm:grid-cols-2 gap-3">
            {data.categories.map((cat, i) => (
              <div key={i} className="rounded-[var(--radius)] border border-[var(--hairline)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-[var(--ink)]">{cat.name}</p>
                  <WinnerPill w={cat.winner} />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm tabular-nums font-semibold" style={{ color: CMP_A }}>A {Number(cat.a).toFixed(1)}</span>
                  <span className="text-sm tabular-nums font-semibold" style={{ color: CMP_B }}>B {Number(cat.b).toFixed(1)}</span>
                </div>
                {cat.reason && <p className="text-xs text-[var(--muted)] leading-relaxed">{cat.reason}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Keywords */}
      {data.keywords && (
        <Section title="Keyword Analysis">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="eyebrow mb-3">Matched (both)</p>
              <Chips items={data.keywords.matched} tone="good" />
            </div>
            <div>
              <p className="eyebrow mb-3">Missing (add these)</p>
              <Chips items={data.keywords.missing} tone="warn" />
            </div>
            <div>
              <p className="eyebrow mb-3">Only in Resume A</p>
              <Chips items={data.keywords.onlyA} tone="a" />
            </div>
            <div>
              <p className="eyebrow mb-3">Only in Resume B</p>
              <Chips items={data.keywords.onlyB} tone="b" />
            </div>
          </div>
        </Section>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <Section title="Skills Comparison" sub="Coverage per area (0–100).">
          <div className="space-y-3">
            {data.skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[var(--ink)]">{s.group}</span>
                  <span className="tabular-nums text-[var(--muted)]">
                    <span style={{ color: CMP_A }}>{Math.round(s.a)}</span> · <span style={{ color: CMP_B }}>{Math.round(s.b)}</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, s.a)}%`, background: CMP_A }} />
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, s.b)}%`, background: CMP_B }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* AI suggestions */}
      {(data.suggestionsA?.length || data.suggestionsB?.length) ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "Resume A — Improvements", items: data.suggestionsA, color: CMP_A },
            { title: "Resume B — Improvements", items: data.suggestionsB, color: CMP_B },
          ].map((s) => (
            <Section key={s.title} title={s.title}>
              <ol className="space-y-3">
                {(s.items || []).map((it, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-sm font-bold tabular-nums flex-shrink-0" style={{ color: s.color }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-[var(--muted)]">{it}</span>
                  </li>
                ))}
              </ol>
            </Section>
          ))}
        </div>
      ) : null}

      {/* Recruiter opinion */}
      {data.recruiter && (
        <Section title="Recruiter Opinion">
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="eyebrow mb-2" style={{ color: CMP_A }}>Resume A</p>
              <p className="text-xs text-[var(--faint)] uppercase tracking-wide mb-1">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-[var(--muted)] space-y-1 mb-3">{(data.recruiter.strengthsA || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
              <p className="text-xs text-[var(--faint)] uppercase tracking-wide mb-1">Weaknesses</p>
              <ul className="list-disc pl-4 text-sm text-[var(--muted)] space-y-1">{(data.recruiter.weaknessesA || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div>
              <p className="eyebrow mb-2" style={{ color: CMP_B }}>Resume B</p>
              <p className="text-xs text-[var(--faint)] uppercase tracking-wide mb-1">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-[var(--muted)] space-y-1 mb-3">{(data.recruiter.strengthsB || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
              <p className="text-xs text-[var(--faint)] uppercase tracking-wide mb-1">Weaknesses</p>
              <ul className="list-disc pl-4 text-sm text-[var(--muted)] space-y-1">{(data.recruiter.weaknessesB || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </div>
          {(data.recruiter.hiringConfidence || data.recruiter.interviewRecommendation) && (
            <div className="mt-5 pt-4 border-t border-[var(--hairline)] grid sm:grid-cols-2 gap-4">
              {data.recruiter.hiringConfidence && (
                <div><p className="eyebrow mb-1">Hiring confidence</p><p className="text-sm text-[var(--muted)]">{data.recruiter.hiringConfidence}</p></div>
              )}
              {data.recruiter.interviewRecommendation && (
                <div><p className="eyebrow mb-1">Interview recommendation</p><p className="text-sm text-[var(--muted)]">{data.recruiter.interviewRecommendation}</p></div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Final verdict */}
      {data.finalVerdict && (
        <Section title="AI Final Verdict">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-display text-xl font-semibold" style={{ color: data.finalVerdict.winner === "A" ? CMP_A : data.finalVerdict.winner === "B" ? CMP_B : "var(--muted)" }}>
              {data.finalVerdict.winner === "A" ? "Resume A" : data.finalVerdict.winner === "B" ? "Resume B" : "Tie"}
            </span>
            <span className="text-xs font-mono text-[var(--muted)]">confidence {Math.round(data.finalVerdict.confidence ?? 0)}%</span>
          </div>
          {data.finalVerdict.reasoning && <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{data.finalVerdict.reasoning}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            {data.finalVerdict.suitableRoles?.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Suitable roles</p>
                <Chips items={data.finalVerdict.suitableRoles} tone="good" />
              </div>
            )}
            {data.finalVerdict.hiringRecommendation && (
              <div>
                <p className="eyebrow mb-2">Hiring recommendation</p>
                <p className="text-sm text-[var(--muted)]">{data.finalVerdict.hiringRecommendation}</p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
