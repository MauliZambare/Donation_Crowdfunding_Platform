import { useState } from "react";

const points = [
  { city: "Mumbai", amount: 285000, x: 28, y: 58 },
  { city: "Delhi", amount: 327000, x: 41, y: 30 },
  { city: "Bengaluru", amount: 231000, x: 44, y: 74 },
  { city: "Pune", amount: 148000, x: 30, y: 63 },
  { city: "Kolkata", amount: 156000, x: 67, y: 47 },
  { city: "Hyderabad", amount: 196000, x: 48, y: 62 },
];

const DonationMap = () => {
  const [selected, setSelected] = useState(points[0]);

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Donation Heatmap (India)</h3>
      <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/70 to-blue-950/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.22),transparent_42%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-80" role="img" aria-label="Donation map of India">
          <path
            d="M46 11l4 4 8 2 3 5 6 4 3 8-2 10 2 8-4 7 2 8-6 7-9 2-2 6-8 5-11-2-6-8-9-5-4-8 2-8-5-6 4-8-1-10 6-5 2-7 7-4z"
            fill="rgba(15,23,42,0.7)"
            stroke="rgba(125,211,252,0.5)"
            strokeWidth="1"
          />
        </svg>

        {points.map((point) => (
          <button
            key={point.city}
            type="button"
            onMouseEnter={() => setSelected(point)}
            onFocus={() => setSelected(point)}
            className="absolute"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-label={`${point.city} INR ${point.amount.toLocaleString()}`}
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-300">{selected.city}: INR {selected.amount.toLocaleString()} donated</p>
    </div>
  );
};

export default DonationMap;
