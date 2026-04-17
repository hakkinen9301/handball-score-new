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

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      {!started && (
        <div style={styles.infoBox}>
          <input
            type="date"
            style={styles.input}
            onChange={(e) => setInfo({ ...info, date: e.target.value })}
          />

          <input
            placeholder="何回戦"
            style={styles.input}
            onChange={(e) => setInfo({ ...info, round: e.target.value })}
          />

          <div style={{ display: "flex", gap: 5 }}>
            <input
              placeholder="チームA"
              style={styles.input}
              onChange={(e) => setInfo({ ...info, home: e.target.value })}
            />
            <div style={{ alignSelf: "center" }}>vs</div>
            <input
              placeholder="チームB"
              style={styles.input}
              onChange={(e) => setInfo({ ...info, away: e.target.value })}
            />
          </div>

          <button style={styles.startBtn} onClick={() => setStarted(true)}>
            試合開始
          </button>
        </div>
      )}

      {started && (
        <>
          <div style={styles.header}>
            <div>{info.date}</div>
            <div>{info.round}</div>
            <div style={{ fontWeight: "bold", fontSize: 22 }}>
              {info.home} vs {info.away}
            </div>
          </div>

          {/* スコア履歴（ジグザグ） */}
          <div style={styles.timeline}>
            {events
              .filter((e) => e.type === "goal")
              .map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      e.team === "blue" ? "flex-start" : "flex-end",
                  }}
                >
                  {e.team === "blue" && (
                    <div>
                      #{e.number} 🔵 {e.score}
                    </div>
                  )}
                  {e.team === "red" && (
                    <div>
                      {e.score} 🔴 #{e.number}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* 入力 */}
          <div style={styles.control}>
            <div style={styles.row}>
              <button
                style={styles.blue}
                onClick={() => setMode("blue-goal")}
              >
                青G
              </button>
              <button
                style={styles.blueSub}
                onClick={() => setMode("blue-miss")}
              >
                青M
              </button>

              <button
                style={styles.red}
                onClick={() => setMode("red-goal")}
              >
                赤G
              </button>
              <button
                style={styles.redSub}
                onClick={() => setMode("red-miss")}
              >
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
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    paddingBottom: 180,
    fontFamily: "sans-serif",
  },

  header: {
    marginTop: 10,
    fontSize: 18,
  },

  timeline: {
    marginTop: 10,
    padding: 10,
    fontSize: 18,
  },

  infoBox: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: {
    fontSize: 16,
    padding: 8,
  },

  startBtn: {
    padding: 10,
    fontSize: 18,
  },

  control: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "#fff",
    padding: 8,
  },

  row: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: 4,
  },

  num: {
    padding: 8,
    fontSize: 16,
  },

  blue: { background: "#3b82f6", color: "#fff", padding: 8 },
  blueSub: { background: "#93c5fd", padding: 8 },
  red: { background: "#ef4444", color: "#fff", padding: 8 },
  redSub: { background: "#fca5a5", padding: 8 },
};
