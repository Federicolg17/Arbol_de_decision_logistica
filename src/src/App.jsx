import { useState, useEffect } from "react";

const HORIZON = 12;

const DECISIONS = [
  {
    id: "A", label: "Venta en\nPunto", shortLabel: "Venta en Punto",
    color: "#3B82F6", colorDark: "#1D4ED8", colorBg: "#EFF6FF",
    icon: "🏪", tag: "SIN INVERSIÓN",
    desc: "Conservar el modelo actual de venta directa en Acacías sin distribución externa.",
    costoInicial: 0, costoOperacional: 3100000,
    desglose: ["Arriendo bodega: $800.000", "Servicios públicos: $300.000", "Salario personal: $2.000.000"],
    scenarios: [
      { label: "Demanda Alta",  prob: 0.25, ing: 36000000, desc: "Temporada pico — obras activas en el municipio" },
      { label: "Demanda Media", prob: 0.50, ing: 24000000, desc: "Comportamiento normal del mercado local" },
      { label: "Demanda Baja",  prob: 0.25, ing: 14400000, desc: "Temporada muerta o competencia fuerte" },
    ]
  },
  {
    id: "B", label: "Flota\nPropia", shortLabel: "Flota Propia",
    color: "#10B981", colorDark: "#065F46", colorBg: "#ECFDF5",
    icon: "🚚", tag: "★ ÓPTIMO",
    desc: "Adquirir 1-2 camionetas para distribución propia a Guamal, San Martín y Granada.",
    costoInicial: 45000000, costoOperacional: 6300000,
    desglose: ["Combustible: $1.800.000", "Salario conductor: $2.000.000", "Mantenimiento: $800.000", "Seguros: $700.000", "Arriendo bodega: $1.000.000"],
    scenarios: [
      { label: "Demanda Alta",  prob: 0.30, ing: 68000000, desc: "Penetración exitosa en municipios aledaños" },
      { label: "Demanda Media", prob: 0.45, ing: 46000000, desc: "Aceptación moderada — crecimiento gradual" },
      { label: "Demanda Baja",  prob: 0.25, ing: 26000000, desc: "Bajo volumen en rutas — flota subutilizada" },
    ]
  },
  {
    id: "C", label: "Tercero\nLogístico", shortLabel: "Tercero Logístico",
    color: "#F59E0B", colorDark: "#92400E", colorBg: "#FFFBEB",
    icon: "🤝", tag: "BAJO RIESGO",
    desc: "Contratar operador logístico regional para entregas y cobertura de municipios.",
    costoInicial: 3000000, costoOperacional: 5300000,
    desglose: ["Tarifa operador: $2.500.000", "Arriendo bodega: $800.000", "Salario personal: $2.000.000"],
    scenarios: [
      { label: "Demanda Alta",  prob: 0.30, ing: 58000000, desc: "Alta demanda — el tercero responde bien" },
      { label: "Demanda Media", prob: 0.50, ing: 40000000, desc: "Operación estable — rutas pactadas cubiertas" },
      { label: "Demanda Baja",  prob: 0.20, ing: 22000000, desc: "Bajo volumen — costo fijo pesa sobre margen" },
    ]
  }
];

function calcVME(d) {
  const costoTotal = d.costoInicial + d.costoOperacional * HORIZON;
  const det = d.scenarios.map(s => {
    const util = s.ing * HORIZON - costoTotal;
    return { ...s, ingresoAnual: s.ing * HORIZON, util, pond: s.prob * util };
  });
  return { costoTotal, vme: det.reduce((a, s) => a + s.pond, 0), det };
}

const cop = n => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const fmt = n => {
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  return a >= 1e9 ? `${s}$${(a/1e9).toFixed(2)}B` : a >= 1e6 ? `${s}$${(a/1e6).toFixed(1)}M` : `${s}$${(a/1e3).toFixed(0)}K`;
};

export default function App() {
  const [sel, setSel] = useState("B");
  const [tab, setTab] = useState("arbol");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const results = DECISIONS.map(calcVME);
  const bestIdx = results.reduce((bi, r, i) => r.vme > results[bi].vme ? i : bi, 0);
  const bestId = DECISIONS[bestIdx].id;
  const selIdx = DECISIONS.findIndex(d => d.id === sel);
  const selD = DECISIONS[selIdx];
  const selR = results[selIdx];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0",
      color: "#E2E8F0"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fade-in { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-in.show { opacity: 1; transform: translateY(0); }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-2px); }
        .tab-btn { transition: all 0.2s ease; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; }
        .scenario-row { transition: background 0.15s ease; }
        .scenario-row:hover { filter: brightness(1.05); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #1E293B; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
      `}</style>

      <div style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#3B82F6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎨</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.3px" }}>El Imperio de las Pinturas</div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "'DM Mono', monospace" }}>Árbol de Decisión · Acacías, Meta · 12 meses</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'DM Mono', monospace" }}>Decisión Óptima</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>🚚 Flota Propia</div>
          </div>
          <div style={{ background: "#10B981", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 8, fontFamily: "'DM Mono', monospace" }}>
            {fmt(results[bestIdx].vme)}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px", background: "rgba(15,23,42,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 4 }}>
        {[["arbol","🌳 Árbol"],["comparativa","📊 Comparativa"],["supuestos","📋 Supuestos"]].map(([id, lbl]) => (
          <button key={id} className="tab-btn" onClick={() => setTab(id)} style={{
            background: "none", color: tab === id ? "#F1F5F9" : "#64748B",
            padding: "14px 16px", fontSize: 13,
            borderBottom: tab === id ? "2px solid #3B82F6" : "2px solid transparent",
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>

        {tab === "arbol" && (
          <div className={`fade-in ${mounted ? "show" : ""}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {DECISIONS.map((d, i) => {
                const r = results[i];
                const isSel = sel === d.id;
                const isBest = d.id === bestId;
                return (
                  <div key={d.id} className="card-hover" onClick={() => setSel(d.id)} style={{
                    background: isSel ? `linear-gradient(135deg, ${d.color}22, ${d.color}11)` : "rgba(30,41,59,0.8)",
                    border: `2px solid ${isSel ? d.color : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, padding: "16px",
                    boxShadow: isSel ? `0 0 24px ${d.color}33, inset 0 1px 0 ${d.color}44` : "none",
                    position: "relative", overflow: "hidden"
                  }}>
                    {isBest && <div style={{ position: "absolute", top: 10, right: 10, background: "#10B981", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, letterSpacing: 0.5 }}>★ ÓPTIMO</div>}
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{d.icon}</div>
                    <div style={{ color: isSel ? "#F1F5F9" : "#94A3B8", fontWeight: 700, fontSize: 13, lineHeight: 1.4, whiteSpace: "pre-line", marginBottom: 6 }}>{d.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.vme >= 0 ? "#10B981" : "#EF4444" }} />
                      <span style={{ color: r.vme >= 0 ? "#34D399" : "#F87171", fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>{fmt(r.vme)}</span>
                      <span style={{ color: "#475569", fontSize: 10 }}>VME</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 16px", marginBottom: 20, overflowX: "auto" }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>
                Diagrama — Selecciona una alternativa arriba
              </div>
              <svg viewBox="0 0 760 360" style={{ width: "100%", minWidth: 580, overflow: "visible" }}>
                <defs>
                  {DECISIONS.map(d => (
                    <marker key={d.id} id={`mk-${d.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill={sel === d.id ? d.color : "#1E293B"} />
                    </marker>
                  ))}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                <rect x={14} y={150} width={60} height={60} rx={8} fill="#1E293B" stroke="#3B82F6" strokeWidth={2} />
                <text x={44} y={174} textAnchor="middle" fill="#94A3B8" fontSize={8} fontFamily="DM Sans">NODO</text>
                <text x={44} y={186} textAnchor="middle" fill="#CBD5E1" fontSize={8} fontWeight="bold" fontFamily="DM Sans">DECISIÓN</text>
                <text x={44} y={198} textAnchor="middle" fill="#3B82F6" fontSize={10} fontFamily="DM Sans">▼</text>

                {DECISIONS.map((d, di) => {
                  const isSel = sel === d.id;
                  const r = results[di];
                  const decY = [65, 180, 295][di];
                  const offsets = [-40, 0, 40];

                  return (
                    <g key={d.id} style={{ cursor: "pointer" }} onClick={() => setSel(d.id)}>
                      <line x1={74} y1={180} x2={178} y2={decY}
                        stroke={isSel ? d.color : "#1E293B"} strokeWidth={isSel ? 2.5 : 1}
                        strokeDasharray={isSel ? "none" : "4,4"}
                        markerEnd={`url(#mk-${d.id})`}
                      />
                      <rect x={180} y={decY - 22} width={76} height={44} rx={8}
                        fill={isSel ? d.color : "#1E293B"}
                        stroke={isSel ? d.color : "#334155"} strokeWidth={isSel ? 2 : 1}
                        filter={isSel ? "url(#glow)" : "none"}
                      />
                      <text x={218} y={decY - 7} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="bold" fontFamily="DM Sans">{d.shortLabel.split(" ").slice(0,2).join(" ")}</text>
                      <text x={218} y={decY + 6} textAnchor="middle" fill={isSel ? "rgba(255,255,255,0.9)" : "#64748B"} fontSize={7.5} fontFamily="DM Mono">{fmt(r.vme)}</text>
                      {d.id === bestId && <text x={218} y={decY - 28} textAnchor="middle" fill="#10B981" fontSize={8} fontWeight="bold" fontFamily="DM Sans">★ ÓPTIMO</text>}
                      <text x={218} y={decY + 17} textAnchor="middle" fill={isSel ? "rgba(255,255,255,0.6)" : "#1E293B"} fontSize={7} fontFamily="DM Mono">{d.tag}</text>

                      {r.det.map((s, si) => {
                        const cy = decY + offsets[si];
                        return (
                          <g key={si}>
                            <line x1={256} y1={decY} x2={370} y2={cy}
                              stroke={isSel ? d.color + "88" : "#0F172A"} strokeWidth={isSel ? 1.5 : 1} />
                            <text x={(256+370)/2} y={(decY+cy)/2 - 5} textAnchor="middle"
                              fill={isSel ? d.color + "cc" : "#0F172A"} fontSize={7.5} fontFamily="DM Mono">p={s.prob}</text>
                            <circle cx={382} cy={cy} r={13}
                              fill={isSel ? d.color + "33" : "#0F172A"}
                              stroke={isSel ? d.color : "#1E293B"} strokeWidth={isSel ? 2 : 1} />
                            <text x={382} y={cy + 3} textAnchor="middle"
                              fill={isSel ? d.color : "#334155"} fontSize={7} fontWeight="bold" fontFamily="DM Sans">
                              {s.label.replace("Demanda ","").toUpperCase().slice(0,4)}
                            </text>
                            <line x1={395} y1={cy} x2={455} y2={cy}
                              stroke={isSel ? d.color + "66" : "#0F172A"} strokeWidth={isSel ? 1.5 : 1} />
                            <rect x={455} y={cy - 16} width={290} height={32} rx={6}
                              fill={isSel ? d.color + "18" : "#0A1122"}
                              stroke={isSel ? d.color + "44" : "#0F172A"} strokeWidth={1} />
                            <text x={466} y={cy - 4} fill={isSel ? "#CBD5E1" : "#1E293B"} fontSize={8} fontFamily="DM Sans">{s.label} — Ing: {fmt(s.ingresoAnual)}</text>
                            <text x={466} y={cy + 9} fill={isSel ? (s.util >= 0 ? "#34D399" : "#F87171") : "#1E293B"} fontSize={8} fontWeight="bold" fontFamily="DM Mono">
                              Util: {fmt(s.util)} | Pond: {fmt(s.pond)}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${selD.color}0d, rgba(15,23,42,0.95))`, border: `1px solid ${selD.color}44`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 32 }}>{selD.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 16 }}>{selD.shortLabel}</div>
                  <div style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>{selD.desc}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                {[["Inversión Inicial", cop(selD.costoInicial)], ["Costo Op/mes", cop(selD.costoOperacional)], ["Costo Total 12m", cop(selR.costoTotal)]].map(([l,v]) => (
                  <div key={l} style={{ background: "rgba(15,23,42,0.7)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "#475569", fontSize: 10, marginBottom: 4 }}>{l}</div>
                    <div style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Desglose costo operacional mensual</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selD.desglose.map(item => (
                    <span key={item} style={{ background: `${selD.color}18`, border: `1px solid ${selD.color}33`, color: "#CBD5E1", fontSize: 11, padding: "4px 10px", borderRadius: 20 }}>{item}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Nodos de azar — Escenarios de demanda</div>
              {selR.det.map((s, i) => (
                <div key={i} className="scenario-row" style={{ background: "rgba(15,23,42,0.5)", border: `1px solid ${selD.color}22`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: `${selD.color}22`, border: `2px solid ${selD.color}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: selD.color, fontWeight: 800, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{(s.prob*100).toFixed(0)}%</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                    <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: s.util >= 0 ? "#34D399" : "#F87171", fontWeight: 700, fontSize: 15, fontFamily: "'DM Mono', monospace" }}>{fmt(s.util)}</div>
                    <div style={{ color: "#475569", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>pond. {fmt(s.pond)}</div>
                  </div>
                </div>
              ))}
              <div style={{ background: `${selD.color}18`, border: `2px solid ${selD.color}55`, borderRadius: 12, padding: "14px 18px", marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>Valor Monetario Esperado (VME)</div>
                  <div style={{ color: "#64748B", fontSize: 10, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>Σ (prob × utilidad neta) — 12 meses</div>
                </div>
                <div style={{ color: selR.vme >= 0 ? "#34D399" : "#F87171", fontWeight: 800, fontSize: 26, fontFamily: "'DM Mono', monospace" }}>{fmt(selR.vme)}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "comparativa" && (
          <div className={`fade-in ${mounted ? "show" : ""}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {DECISIONS.map((d, i) => {
                const r = results[i];
                const isBest = d.id === bestId;
                return (
                  <div key={d.id} style={{
                    background: isBest ? `linear-gradient(160deg, ${d.color}22, ${d.color}08)` : "rgba(15,23,42,0.8)",
                    border: `2px solid ${isBest ? d.color : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 16, padding: 20,
                    boxShadow: isBest ? `0 8px 32px ${d.color}22` : "none"
                  }}>
                    {isBest && <div style={{ background: "#10B981", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 20, display: "inline-block", marginBottom: 10, letterSpacing: 0.5 }}>★ RECOMENDADA</div>}
                    <div style={{ fontSize: 30, marginBottom: 8 }}>{d.icon}</div>
                    <div style={{ color: "#F1F5F9", fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{d.shortLabel}</div>
                    {[["Inversión inicial", cop(d.costoInicial)], ["Costo op/mes", cop(d.costoOperacional)], ["Costo total 12m", cop(r.costoTotal)]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 7, marginBottom: 7, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "#64748B", fontSize: 11 }}>{l}</span>
                        <span style={{ color: "#CBD5E1", fontWeight: 600, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <div style={{ color: "#64748B", fontSize: 10, marginBottom: 4 }}>VME 12 meses</div>
                      <div style={{ color: r.vme >= 0 ? "#34D399" : "#F87171", fontWeight: 800, fontSize: 20, fontFamily: "'DM Mono', monospace" }}>{cop(r.vme)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <div style={{ color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>Comparativa Visual VME</div>
              {DECISIONS.map((d, i) => {
                const vme = results[i].vme;
                const maxVme = Math.max(...results.map(r => r.vme));
                const pct = Math.max(6, (vme / maxVme) * 100);
                return (
                  <div key={d.id} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ color: "#CBD5E1", fontSize: 13, fontWeight: 600 }}>{d.icon} {d.shortLabel}</span>
                      <span style={{ color: vme >= 0 ? "#34D399" : "#F87171", fontWeight: 700, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{cop(vme)}</span>
                    </div>
                    <div style={{ height: 16, background: "#1E293B", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                        borderRadius: 8, transition: "width 0.8s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "supuestos" && (
          <div className={`fade-in ${mounted ? "show" : ""}`}>
            <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>📋 Supuestos y Justificación</div>
              <div style={{ color: "#64748B", fontSize: 12, marginBottom: 20 }}>Todos los valores en pesos colombianos (COP). Horizonte de análisis: 12 meses.</div>
              <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ color: "#93C5FD", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Fórmulas base</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#CBD5E1", lineHeight: 1.8 }}>
                  <div>Utilidad neta = (Ingresos/mes × 12) − Inversión − (Costo op/mes × 12)</div>
                  <div>VME = Σ (Probabilidad × Utilidad neta)</div>
                  <div style={{ color: "#64748B", fontSize: 11, marginTop: 4 }}>Salario base empleados: <strong style={{ color: "#34D399" }}>$2.000.000 COP/mes</strong></div>
                </div>
              </div>
              {DECISIONS.map((d, di) => (
                <div key={d.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ color: d.color, fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{d.icon}</span> {d.shortLabel}
                    <span style={{ background: `${d.color}22`, border: `1px solid ${d.color}44`, color: d.color, fontSize: 9, padding: "2px 8px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>{d.tag}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ background: "rgba(15,23,42,0.7)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ color: "#475569", fontSize: 10, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>INVERSIÓN INICIAL</div>
                      <div style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{cop(d.costoInicial)}</div>
                      <div style={{ color: "#475569", fontSize: 11 }}>
                        {di===0?"Sin inversión — mantiene operación actual":di===1?"Camionetas usadas NHR/NPR en Villavicencio. Incluye matrícula, SOAT y adecuación.":"Contrato inicio: garantía, papelería y señalización con operador logístico."}
                      </div>
                    </div>
                    <div style={{ background: "rgba(15,23,42,0.7)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ color: "#475569", fontSize: 10, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>COSTO OPERACIONAL/MES</div>
                      <div style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{cop(d.costoOperacional)}</div>
                      <div style={{ color: "#64748B", fontSize: 11 }}>{d.desglose.join(" + ")}</div>
                    </div>
                  </div>
                  <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Escenarios de demanda</div>
                  {d.scenarios.map((s, si) => (
                    <div key={si} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: `${d.color}22`, border: `1px solid ${d.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ color: d.color, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{(s.prob*100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span style={{ color: "#CBD5E1", fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                        <span style={{ color: "#64748B", fontSize: 11 }}> — {cop(s.ing)}/mes</span>
                        <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ color: "#FCD34D", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>⚠️ Nota metodológica</div>
                <div style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.7 }}>
                  Valores estimados con base en el mercado de Acacías–Villavicencio (2024-2025) para distribuidoras PYME de pinturas y materiales de construcción. Probabilidades asignadas según estacionalidad de la construcción en el Meta. Se recomienda validar con datos históricos de ventas de la empresa.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
