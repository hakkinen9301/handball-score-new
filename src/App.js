import { useState } from "react";

export default function App() {
  const [info, setInfo] = useState({
    date: "",
    round: "",
    home: "",
    away: "",
  });

  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);

  const addEvent = (team, type, number) => {
    if (!started) return;

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

  const undo = () => setEvents((prev) => prev.slice(0, -1));
  const reset = () => setEvents([]);

  const goalStats = events.reduce((acc, e) => {
    if (e.type === "goal") {
      const key = `${e.team}-${e.number}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      {!started && (
        <div style={styles.infoBox}>
          <input type="date" style={styles.input} onChange={(e) => setInfo({ ...info, date: e.target.value })}/>
          <input placeholder="何回戦" style={styles.input} onChange={(e) => setInfo({ ...info, round: e.target.value })}/>

          <div style={styles.teamRow}>
            <input placeholder="チームA" style={styles.teamInput} onChange={(e) => setInfo({ ...info, home: e.target.value })}/>
            <div style={styles.vs}>vs</div>
            <input placeholder="チームB" style={styles.teamInput} onChange={(e) => setInfo({ ...info, away: e.target.value })}/>
          </div>

          <button style={styles.startBtn} onClick={() => setStarted(true)}>試合開始</button>
        </div>
      )}

      {started && (
        <>
          <div style={styles.header}>
            <div>{info.date}</div>
            <div>{info.round}</div>
            <div style={styles.title}>{info.home} vs {info.away}</div>
          </div>

          <div style={styles.actions}>
            <button onClick={undo}>↩</button>
            <button onClick={reset}>🗑</button>
          </div>

          {/* スコア履歴 */}
          <div>
            {events.map((e, i) => (
              <div key={i} style={styles.rowLine}>
                <div style={styles.left}>
                  {e.team === "blue" && `#${e.number} ${e.type === "goal" ? "🔵" : "❌"}`}
                </div>
                <div style={styles.center}>{e.score}</div>
                <div style={styles.right}>
                  {e.team === "red" && `${e.type === "goal" ? "🔴" : "❌"} #${e.number}`}
                </div>
              </div>
            ))}
          </div>

          {/* 背番号別 */}
          <div style={styles.stats}>
            {Object.entries(goalStats).map(([key, count]) => {
              const [team, num] = key.split("-");
              return (
                <div key={key} style={styles.rowLine}>
                  <div style={styles.left}>
                    {team === "blue" && `#${num} 🔵 ${count}`}
                  </div>
                  <div style={styles.center}></div>
                  <div style={styles.right}>
                    {team === "red" && `🔴 ${count} #${num}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 入力 */}
          <div style={styles.control}>
            <div style={styles.row}>
              <button style={styles.bigBlue} onClick={() => setMode("blue-goal")}>青G</button>
              <button style={styles.bigBlueSub} onClick={() => setMode("blue-miss")}>青M</button>
              <button style={styles.bigRed} onClick={() => setMode("red-goal")}>赤G</button>
              <button style={styles.bigRedSub} onClick={() => setMode("red-miss")}>赤M</button>
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
        </>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", paddingBottom: 220 },

  header: { marginTop: 10 },
  title: { fontSize: 22, fontWeight: "bold" },

  actions: {
    display: "flex",
    justifyContent: "space-around",
    margin: 10,
  },

  rowLine: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 1fr",
    alignItems: "center",
  },

  left: { textAlign: "right", paddingRight: 10 },
  center: { textAlign: "center", fontWeight: "bold" },
  right: { textAlign: "left", paddingLeft: 10 },

  stats: { marginTop: 10 },

  infoBox: { marginTop: 40 },
  input: { padding: 8 },

  teamRow: {
    display: "grid",
    gridTemplateColumns: "1fr 50px 1fr",
  },

  teamInput: { textAlign: "center" },
  vs: { textAlign: "center" },

  startBtn: { marginTop: 10 },

  control: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "#fff",
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
    padding: 12,
    fontSize: 18,
  },

  bigBlue: { background: "#3b82f6", color: "#fff", padding: 14, fontSize: 18 },
  bigBlueSub: { background: "#93c5fd", padding: 14, fontSize: 18 },
  bigRed: { background: "#ef4444", color: "#fff", padding: 14, fontSize: 18 },
  bigRedSub: { background: "#fca5a5", padding: 14, fontSize: 18 },
};
