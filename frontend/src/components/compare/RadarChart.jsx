// A lightweight, dependency-free radar chart comparing two resumes.
// Values are 0–100. Colours come from the design tokens (--cmp-a / --cmp-b).

function polar(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export default function RadarChart({ axes = [], labelA = "Resume A", labelB = "Resume B" }) {
  const n = axes.length;
  if (n < 3) return null;

  const c = 200;
  const R = 120;
  const angleOf = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (val, i) => polar(c, c, (Math.max(0, Math.min(100, val)) / 100) * R, angleOf(i));

  const polyStr = (key) => axes.map((ax, i) => pt(ax[key], i).join(",")).join(" ");
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg viewBox="-70 -34 540 470" className="w-full h-auto overflow-visible" role="img" aria-label="Radar comparison">
        {/* grid rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={axes.map((_, i) => polar(c, c, r * R, angleOf(i)).join(",")).join(" ")}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="1"
          />
        ))}
        {/* spokes */}
        {axes.map((_, i) => {
          const [x, y] = polar(c, c, R, angleOf(i));
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--hairline)" strokeWidth="1" />;
        })}

        {/* Resume B (drawn first, behind) */}
        <polygon points={polyStr("b")} fill="var(--cmp-b)" fillOpacity="0.16" stroke="var(--cmp-b)" strokeWidth="2" strokeLinejoin="round" />
        {/* Resume A */}
        <polygon points={polyStr("a")} fill="var(--cmp-a)" fillOpacity="0.16" stroke="var(--cmp-a)" strokeWidth="2" strokeLinejoin="round" />

        {/* points */}
        {axes.map((ax, i) => {
          const [bx, by] = pt(ax.b, i);
          const [ax_, ay_] = pt(ax.a, i);
          return (
            <g key={i}>
              <circle cx={bx} cy={by} r="3" fill="var(--cmp-b)" />
              <circle cx={ax_} cy={ay_} r="3" fill="var(--cmp-a)" />
            </g>
          );
        })}

        {/* axis labels */}
        {axes.map((ax, i) => {
          const [lx, ly] = polar(c, c, R + 16, angleOf(i));
          const anchor = Math.abs(lx - c) < 12 ? "middle" : lx > c ? "start" : "end";
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--muted)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {ax.axis}
            </text>
          );
        })}
      </svg>

      <div className="flex justify-center gap-6 mt-3">
        <span className="flex items-center gap-2 text-sm text-[var(--ink)]">
          <i className="w-3 h-3 rounded-sm" style={{ background: "var(--cmp-a)" }} /> {labelA}
        </span>
        <span className="flex items-center gap-2 text-sm text-[var(--ink)]">
          <i className="w-3 h-3 rounded-sm" style={{ background: "var(--cmp-b)" }} /> {labelB}
        </span>
      </div>
    </div>
  );
}
