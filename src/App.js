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
      let b = 0, r = 0;

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

  // ■ 前半後半＋合計
  let first = { b: 0, r: 0 };
  let second = { b: 0, r: 0 };
  let half = "first";

  events.forEach((e) => {
    if (e.type === "section") {
      if (e.label.includes("後半")) half = "second";
      return;
    }
    if (e.type === "goal") {
      if (half === "first") {
        if (e.team === "blue") first.b++;
        if (e.team === "red") first.r++;
      } else {
        if (e.team === "blue") second.b++;
        if (e.team === "red") second.r++;
      }
    }
  });

  const totalB = first.b + second.b;
  const totalR = first.r + second.r;

  // ■ 得点者
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

  const save = async () => {
    const canvas = await html2canvas(captureRef.current, {
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
          {/* ■ 上固定 */}
          <div style={styles.header}>
            <div>{info.date}　{info.round}</div>
            <div style={styles.title}>{info.home} vs {info.away}</div>
            <div>合計 {totalB}-{totalR}</div>
            <div>前半 {first.b}-{first.r}</div>
            <div>後半 {second.b}-{second.r}</div>
          </div>

          {/* ■ 履歴 */}
          <div ref={captureRef} style={styles.timeline}>
            {events.map((e, i) => {
              if (e.type === "section") {
                return <div key={i} style={styles.section}>{e.label}</div>;
              }

              const mark =
                e.type === "goal"
                  ? e.team === "blue" ? "🔵" : "🔴"
                  : e.type === "miss"
                  ? "❌"
                  : e.type === "out"
                  ? "⛔"
                  : "↩";

              return (
                <div key={i} style={styles.row}>
                  <div style={styles.leftOut}>
                    {e.team === "blue" && (e.type === "out" || e.type === "in") && `#${e.number} ${mark}`}
                  </div>

                  <div style={styles.left}>
                    {e.team === "blue" && (e.type === "goal" || e.type === "miss") && `#${e.number} ${mark}`}
                  </div>

                  <div style={styles.center}>
                    {(e.type === "goal" || e.type === "miss") && e.score}
                  </div>

                  <div style={styles.right}>
                    {e.team === "red" && (e.type === "goal" || e.type === "miss") && `${mark} #${e.number}`}
                  </div>

                  <div style={styles.rightOut}>
                    {e.team === "red" && (e.type === "out" || e.type === "in") && `${mark} #${e.number}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ■ 下固定 */}
          <div style={styles.bottom}>
            {/* 得点者 */}
            <div style={styles.stats}>
              <div>
                {blueList.map((p, i) => <div key={i}>#{p.num} 🔵 {p.count}</div>)}
              </div>
              <div>
                {redList.map((p, i) => <div key={i}>#{p.num} 🔴 {p.count}</div>)}
              </div>
            </div>

            {/* ボタン */}
            <div style={styles.btnRow}>
              <button style={styles.blue} onClick={() => setMode("blue-goal")}>青G</button>
              <button style={styles.blueSub} onClick={() => setMode("blue-miss")}>青M</button>
              <button style={styles.red} onClick={() => setMode("red-goal")}>赤G</button>
              <button style={styles.redSub} onClick={() => setMode("red-miss")}>赤M</button>

              <button style={styles.blueSub} onClick={() => setMode("blue-out")}>青OUT</button>
              <button style={styles.blueSub} onClick={() => setMode("blue-in")}>青IN</button>
              <button style={styles.redSub} onClick={() => setMode("red-out")}>赤OUT</button>
              <button style={styles.redSub} onClick={() => setMode("red-in")}>赤IN</button>
            </div>

            <div style={styles.grid}>
              {numbers.map((n) => (
                <button key={n} style={styles.num}
                  onClick={() => {
                    if (!mode) return;
                    const [team, type] = mode.split("-");
                    addEvent(team, type, n);
                  }}>
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

  timeline: {
    flex: 1,
    overflowY: "auto",
    padding: 10,
    background: "#0a0a0a",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "50px 110px 70px 110px 50px",
  },

  leftOut: { textAlign: "right", color: "#60a5fa" },
  left: { textAlign: "right", color: "#60a5fa" },
  center: { textAlign: "center", fontWeight: "bold" },
  right: { textAlign: "left", color: "#f87171" },
  rightOut: { textAlign: "left", color: "#f87171" },

  bottom: {
    position: "sticky",
    bottom: 0,
    background: "#000",
    padding: 10,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: 5,
  },

  btnRow: {
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
    fontSize: 16,
    background: "#222",
    color: "#fff",
  },

  blue: { background: "#2563eb", color: "#fff", padding: 10 },
  blueSub: { background: "#3b82f6", color: "#fff", padding: 10 },
  red: { background: "#dc2626", color: "#fff", padding: 10 },
  redSub: { background: "#ef4444", color: "#fff", padding: 10 },

  actions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 5,
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
