import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

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

  const timelineRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    timelineRef.current?.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [events]);

  const addEvent = (team, type, number) => {
    setEvents((prev) => {
      const list = [...prev, { team, type, number }];
      let b = 0,
        r = 0;
      return list.map((e) => {
        if (e.type === "goal") {
          if (e.team === "blue") b++;
          if (e.team === "red") r++;
        }
        return { ...e, score: `${b}-${r}` };
      });
    });
  };

  const addSection = (label) =>
    setEvents((prev) => [...prev, { type: "section", label }]);

  const undo = () => setEvents((prev) => prev.slice(0, -1));

  // 得点集計
  const goalStats = events.reduce((acc, e) => {
    if (e.type === "goal") {
      const key = `${e.team}-${e.number}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const blueList = Object.entries(goalStats)
    .filter(([k]) => k.startsWith("blue"))
    .map(([k, v]) => ({ num: Number(k.split("-")[1]), count: v }))
    .sort((a, b) => a.num - b.num)
    .slice(0, 8);

  const redList = Object.entries(goalStats)
    .filter(([k]) => k.startsWith("red"))
    .map(([k, v]) => ({ num: Number(k.split("-")[1]), count: v }))
    .sort((a, b) => a.num - b.num)
    .slice(0, 8);

  // 画像保存
  const save = async () => {
    const el = captureRef.current;

    const canvas = await html2canvas(el, {
      backgroundColor: "#0a0a0a",
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const numbers = Array.from({ length: 15 }, (_, i) => i + 1);

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
          <button onClick={() => setStarted(true)}>開始</button>
        </div>
      )}

      {started && (
        <>
          {/* ★固定ヘッダー */}
          <div style={styles.header}>
            <div>{info.date}　{info.round}</div>
            <div style={styles.title}>{info.home} vs {info.away}</div>
          </div>

          {/* ★画像対象 */}
          <div ref={captureRef} style={styles.captureArea}>
            {/* スコア履歴 */}
            <div ref={timelineRef} style={styles.timeline}>
              {events.map((e, i) => {
                if (e.type === "section") {
                  return <div key={i} style={styles.section}>{e.label}</div>;
                }

                const mark =
                  e.type === "goal"
                    ? e.team === "blue"
                      ? "🔵"
                      : "🔴"
                    : e.type === "miss"
                    ? "❌"
                    : e.type === "out"
                    ? "⛔"
                    : "↩";

                return (
                  <div key={i} style={styles.row}>
                    <div style={styles.col1}>
                      {e.team === "blue" &&
                        (e.type === "out" || e.type === "in") &&
                        `#${e.number} ${mark}`}
                    </div>

                    <div style={styles.col2}>
                      {e.team === "blue" &&
                        (e.type === "goal" || e.type === "miss") &&
                        `#${e.number} ${mark}`}
                    </div>

                    <div style={styles.col3}>
                      {e.type === "goal" || e.type === "miss"
                        ? e.score
                        : ""}
                    </div>

                    <div style={styles.col4}>
                      {e.team === "red" &&
                        (e.type === "goal" || e.type === "miss") &&
                        `${mark} #${e.number}`}
                    </div>

                    <div style={styles.col5}>
                      {e.team === "red" &&
                        (e.type === "out" || e.type === "in") &&
                        `${mark} #${e.number}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ★背番号得点（画像にも含む） */}
            <div style={styles.stats}>
              <div>
                {blueList.map((p, i) => (
                  <div key={i}>#{p.num} 🔵 {p.count}</div>
                ))}
              </div>
              <div>
                {redList.map((p, i) => (
                  <div key={i}>#{p.num} 🔴 {p.count}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ★下部固定 */}
          <div style={styles.bottom}>
            <div style={styles.btnRow}>
              <div>
                <button onClick={() => setMode("blue-goal")}>青G</button>
                <button onClick={() => setMode("blue-miss")}>青M</button>
                <button onClick={() => setMode("blue-out")}>青OUT</button>
                <button onClick={() => setMode("blue-in")}>青IN</button>
              </div>
              <div>
                <button onClick={() => setMode("red-goal")}>赤G</button>
                <button onClick={() => setMode("red-miss")}>赤M</button>
                <button onClick={() => setMode("red-out")}>赤OUT</button>
                <button onClick={() => setMode("red-in")}>赤IN</button>
              </div>
            </div>

            <div style={styles.grid}>
              {numbers.map((n) => (
                <button
                  key={n}
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

            <div style={styles.actions}>
              <button onClick={undo}>戻る</button>
              <button onClick={save}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0a0a0a",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    position: "sticky",
    top: 0,
    background: "#000",
    textAlign: "center",
    padding: 10,
    zIndex: 10,
  },

  title: { fontSize: 18, fontWeight: "bold" },

  captureArea: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  timeline: {
    flex: 1,
    overflowY: "auto",
    height: "45vh",
    background: "#0a0a0a",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "60px 120px 80px 120px 60px",
    alignItems: "center",
  },

  col1: { textAlign: "right", color: "#60a5fa" },
  col2: { textAlign: "right", color: "#60a5fa" },
  col3: { textAlign: "center", fontWeight: "bold" },
  col4: { textAlign: "left", color: "#f87171" },
  col5: { textAlign: "left", color: "#f87171" },

  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    padding: 10,
  },

  bottom: {
    position: "sticky",
    bottom: 0,
    background: "#000",
    padding: 10,
  },

  btnRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 10,
  },

  infoBox: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: { padding: 8 },

  teamRow: {
    display: "grid",
    gridTemplateColumns: "1fr 50px 1fr",
  },

  teamInput: { textAlign: "center" },
  vs: { textAlign: "center" },
};
