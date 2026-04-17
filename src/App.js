import { useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);

  const addEvent = (team, type, number) => {
    setEvents((prev) => {
      const newEvents = [...prev, { team, type, number }];

      let blue = 0;
      let red = 0;

      return newEvents.map((e) => {
        if (e.type === "goal") {
          if (e.team === "blue") blue++;
          if (e.team === "red") red++;
        }
        return { ...e, score: `${blue}-${red}` };
      });
    });
  };

  const goalStats = events.reduce((acc, e) => {
    if (e.type === "goal") {
      const key = `${e.team}-${e.number}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const numbers = Array.from({ length: 15 }, (_, i) => i + 1);

  const blueList = Object.entries(goalStats)
    .filter(([k]) => k.startsWith("blue"))
    .map(([k, v]) => ({ num: k.split("-")[1], count: v }));

  const redList = Object.entries(goalStats)
    .filter(([k]) => k.startsWith("red"))
    .map(([k, v]) => ({ num: k.split("-")[1], count: v }));

  return (
    <div style={styles.container}>
      {/* スコア履歴 */}
      <div style={styles.timeline}>
        {events.map((e, i) => (
          <div key={i} style={styles.rowLine}>
            <div style={styles.left}>
              {e.team === "blue" &&
                `#${e.number} ${e.type === "goal" ? "🔵" : "❌"}`}
            </div>
            <div style={styles.center}>{e.score}</div>
            <div style={styles.right}>
              {e.team === "red" &&
                `${e.type === "goal" ? "🔴" : "❌"} #${e.number}`}
            </div>
          </div>
        ))}
      </div>

      {/* 背番号別 */}
      <div style={styles.stats}>
        <div style={styles.col}>
          {blueList.map((p, i) => (
            <div key={i} style={styles.statRow}>
              #{p.num} 🔵 {p.count}
            </div>
          ))}
        </div>

        <div style={styles.col}>
          {redList.map((p, i) => (
            <div key={i} style={styles.statRowRight}>
              🔴 {p.count} #{p.num}
            </div>
          ))}
        </div>
      </div>

      {/* 入力 */}
      <div style={styles.control}>
        <div style={styles.row}>
          <button style={styles.blue} onClick={() => setMode("blue-goal")}>
            青G
          </button>
          <button style={styles.blueSub} onClick={() => setMode("blue-miss")}>
            青M
          </button>
          <button style={styles.red} onClick={() => setMode("red-goal")}>
            赤G
          </button>
          <button style={styles.redSub} onClick={() => setMode("red-miss")}>
            赤M
          </button>
        </div>

        <div style={styles.grid}>
          {numbers.map((n) => (
            <button
              key={n}
              style={styles.num}
              onClick={() => {
                if (!mode) return;
                const [team, type] = mode.split("-");
                addEvent(team, type, n);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(#0a0a0a, #1a1a1a)",
    color: "#fff",
    minHeight: "100vh",
    paddingBottom: 220,
    fontFamily: "sans-serif",
  },

  timeline: {
    maxHeight: 250,
    overflowY: "auto",
    padding: 10,
  },

  rowLine: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 1fr",
    alignItems: "center",
    marginBottom: 4,
  },

  left: { textAlign: "right", color: "#60a5fa" },
  center: { textAlign: "center", fontWeight: "bold", fontSize: 18 },
  right: { textAlign: "left", color: "#f87171" },

  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    padding: 10,
    marginTop: 10,
  },

  col: {},

  statRow: {
    textAlign: "left",
    marginBottom: 4,
  },

  statRowRight: {
    textAlign: "right",
    marginBottom: 4,
  },

  control: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "#111",
    padding: 10,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 5,
    marginBottom: 5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: 5,
  },

  num: {
    padding: 14,
    fontSize: 18,
    background: "#222",
    color: "#fff",
    borderRadius: 8,
  },

  blue: { background: "#2563eb", color: "#fff", padding: 14 },
  blueSub: { background: "#3b82f6", padding: 14 },
  red: { background: "#dc2626", color: "#fff", padding: 14 },
  redSub: { background: "#ef4444", padding: 14 },
};
