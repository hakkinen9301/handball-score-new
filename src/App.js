import { useState } from "react";

export default function App() {
  const [matchInfo, setMatchInfo] = useState({
    date: "",
    round: "",
    teams: "",
  });

  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);

  const addEvent = (team, type, number) => {
    if (!started) return;

    setEvents((prev) => [
      ...prev,
      {
        team,
        type,
        number,
      },
    ]);
  };

  const getScore = () => {
    let blue = 0;
    let red = 0;
    events.forEach((e) => {
      if (e.type === "goal") {
        if (e.team === "blue") blue++;
        if (e.team === "red") red++;
      }
    });
    return { blue, red };
  };

  const goalStats = events.reduce((acc, e) => {
    if (e.type === "goal") {
      const key = `${e.team}-${e.number}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const score = getScore();

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      {/* 試合情報 */}
      {!started && (
        <div style={styles.infoBox}>
          <input
            placeholder="試合日"
            style={styles.input}
            onChange={(e) =>
              setMatchInfo({ ...matchInfo, date: e.target.value })
            }
          />
          <input
            placeholder="何回戦"
            style={styles.input}
            onChange={(e) =>
              setMatchInfo({ ...matchInfo, round: e.target.value })
            }
          />
          <input
            placeholder="チーム名（例：A vs B）"
            style={styles.input}
            onChange={(e) =>
              setMatchInfo({ ...matchInfo, teams: e.target.value })
            }
          />

          <button style={styles.startBtn} onClick={() => setStarted(true)}>
            試合開始
          </button>
        </div>
      )}

      {started && (
        <>
          {/* 試合情報表示 */}
          <div style={styles.header}>
            <div style={styles.date}>{matchInfo.date}</div>
            <div style={styles.round}>{matchInfo.round}</div>
            <div style={styles.teams}>{matchInfo.teams}</div>
          </div>

          {/* スコア */}
          <div style={styles.score}>
            🔵 {score.blue} - {score.red} 🔴
          </div>

          {/* ゴール履歴 */}
          <div style={styles.history}>
            {events
              .filter((e) => e.type === "goal")
              .map((e, i) => (
                <div key={i}>
                  {e.team === "blue" ? "🔵" : "🔴"} #{e.number}
                </div>
              ))}
          </div>

          {/* 背番号別 */}
          <div style={styles.stats}>
            {Object.entries(goalStats).map(([key, count]) => {
              const [team, num] = key.split("-");
              return (
                <div key={key}>
                  {team === "blue" ? "🔵" : "🔴"} #{num}:{count}
                </div>
              );
            })}
          </div>

          {/* 入力エリア（下固定） */}
          <div style={styles.control}>
            <div style={styles.row}>
              <button
                style={styles.blueBtn}
                onClick={() => setMode("blue-goal")}
              >
                青ゴール
              </button>
              <button
                style={styles.blueMiss}
                onClick={() => setMode("blue-miss")}
              >
                青ミス
              </button>
            </div>

            <div style={styles.row}>
              <button
                style={styles.redBtn}
                onClick={() => setMode("red-goal")}
              >
                赤ゴール
              </button>
              <button
                style={styles.redMiss}
                onClick={() => setMode("red-miss")}
              >
                赤ミス
              </button>
            </div>

            <div style={styles.numberGrid}>
              {numbers.map((n) => (
                <button
                  key={n}
                  style={styles.number}
                  onClick={() => handleNumber(n)}
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

  // 状態管理
  function setMode(m) {
    window.currentMode = m;
  }

  function handleNumber(n) {
    const m = window.currentMode;
    if (!m) return;

    const [team, type] = m.split("-");
    addEvent(team, type, n);
  }
}

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "sans-serif",
    paddingBottom: "220px",
  },

  header: {
    marginTop: 10,
    fontSize: 20,
  },

  date: { fontSize: 22 },
  round: { fontSize: 20 },
  teams: { fontSize: 24, fontWeight: "bold" },

  score: {
    fontSize: 36,
    margin: 10,
  },

  history: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 18,
  },

  stats: {
    marginTop: 10,
    fontSize: 18,
  },

  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 50,
  },

  input: {
    fontSize: 18,
    padding: 10,
  },

  startBtn: {
    fontSize: 20,
    padding: 12,
    background: "black",
    color: "white",
    borderRadius: 10,
  },

  control: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "#fff",
    padding: 10,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
  },

  row: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 5,
  },

  blueBtn: {
    background: "#3b82f6",
    color: "white",
    fontSize: 18,
    padding: 12,
    width: "45%",
    borderRadius: 10,
  },

  blueMiss: {
    background: "#93c5fd",
    fontSize: 18,
    padding: 12,
    width: "45%",
    borderRadius: 10,
  },

  redBtn: {
    background: "#ef4444",
    color: "white",
    fontSize: 18,
    padding: 12,
    width: "45%",
    borderRadius: 10,
  },

  redMiss: {
    background: "#fca5a5",
    fontSize: 18,
    padding: 12,
    width: "45%",
    borderRadius: 10,
  },

  numberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 5,
    marginTop: 5,
  },

  number: {
    fontSize: 18,
    padding: 10,
    borderRadius: 8,
  },
};
