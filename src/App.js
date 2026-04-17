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

  const bottomRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

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

  const addSection = (label) => {
    setEvents((prev) => [...prev, { type: "section", label }]);
  };

  const undo = () => setEvents((prev) => prev.slice(0, -1));

  // 前半後半スコア
  let firstHalf = { blue: 0, red: 0 };
  let secondHalf = { blue: 0, red: 0 };
  let current = "first";

  events.forEach((e) => {
    if (e.type === "section") {
      if (e.label.includes("後半")) current = "second";
      return;
    }
    if (e.type === "goal") {
      if (current === "first") {
        if (e.team === "blue") firstHalf.blue++;
        if (e.team === "red") firstHalf.red++;
      } else {
        if (e.team === "blue") secondHalf.blue++;
        if (e.team === "red") secondHalf.red++;
      }
    }
  });

  // ★合計スコア
  const totalBlue = firstHalf.blue + secondHalf.blue;
  const totalRed = firstHalf.red + secondHalf.red;

  const save = async () => {
    const element = captureRef.current;
    if (!element) return;

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    element.style.height = "auto";
    element.style.overflow = "visible";

    await new Promise((r) => setTimeout(r, 100));

    const canvas = await html2canvas(element, {
      backgroundColor: "#0a0a0a",
      scale: 2,
    });

    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "score.png", { type: "image/png" });

      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: "試合スコア",
          });
        } catch (e) {}
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL();
        link.download = "score.png";
        link.click();
      }
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
    .map(([k, v]) => ({ num: Number(k.split("-")[1]), count: v }))
    .sort((a, b) => a.num - b.num)
    .slice(0, 8);

  const redList = Object.entries(goalStats)
    .filter(([k]) => k.startsWith("red"))
    .map(([k, v]) => ({ num: Number(k.split("-")[1]), count: v }))
    .sort((a, b) => a.num - b.num)
    .slice(0, 8);

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
          {/* ★ここ全体を画像化 */}
          <div ref={captureRef}>
            <div style={styles.header}>
              <div>{info.date}</div>
              <div>{info.round}</div>
              <div style={styles.title}>{info.home} vs {info.away}</div>

              <div style={styles.total}>合計 {totalBlue}-{totalRed}</div>
              <div>前半 {firstHalf.blue}-{firstHalf.red}</div>
              <div>後半 {secondHalf.blue}-{secondHalf.red}</div>
            </div>

            <div style={styles.timeline}>
              {events.map((e, i) => {
                if (e.type === "section") {
                  return <div key={i} style={styles.section}>ーー {e.label} ーー</div>;
                }

                let outLeft = "";
                let left = "";
                let center = "";
                let right = "";
                let outRight = "";

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

                if (e.type === "goal" || e.type === "miss") {
                  center = e.score;
                  if (e.team === "blue") left = `#${e.number} ${mark}`;
                  else right = `${mark} #${e.number}`;
                }

                if (e.type === "out" || e.type === "in") {
                  if (e.team === "blue") outLeft = `#${e.number} ${mark}`;
                  else outRight = `${mark} #${e.number}`;
                }

                return (
                  <div key={i} style={styles.rowLine}>
                    <div style={styles.colOutLeft}>{outLeft}</div>
                    <div style={styles.colLeft}>{left}</div>
                    <div style={styles.colCenter}>{center}</div>
                    <div style={styles.colRight}>{right}</div>
                    <div style={styles.colOutRight}>{outRight}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statGrid}>
              {blueList.map((p, i) => <div key={i}>#{p.num} 🔵 {p.count}</div>)}
            </div>
            <div style={styles.statGrid}>
              {redList.map((p, i) => <div key={i}>#{p.num} 🔴 {p.count}</div>)}
            </div>
          </div>

          <div style={styles.sectionBtns}>
            <button onClick={() => addSection("前半開始")}>前半</button>
            <button onClick={() => addSection("後半開始")}>後半</button>
          </div>

          <div style={styles.control}>
            <div style={styles.row}>
              <button style={styles.blue} onClick={() => setMode("blue-goal")}>青G</button>
              <button style={styles.blueSub} onClick={() => setMode("blue-miss")}>青M</button>
              <button style={styles.blueSub} onClick={() => setMode("blue-out")}>青OUT</button>
              <button style={styles.blueSub} onClick={() => setMode("blue-in")}>青IN</button>

              <button style={styles.red} onClick={() => setMode("red-goal")}>赤G</button>
              <button style={styles.redSub} onClick={() => setMode("red-miss")}>赤M</button>
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
          </div>

          <div style={styles.bottomActions}>
            <button onClick={undo}>↩ 戻る</button>
            <button onClick={save}>📤 共有</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#0a0a0a", color: "#fff", height: "100vh", display: "flex", flexDirection: "column" },
  header: { textAlign: "center", padding: 10, borderBottom: "1px solid #333" },
  title: { fontSize: 20, fontWeight: "bold" },
  total: { fontSize: 22, fontWeight: "bold" },

  timeline: { padding: 10 },

  rowLine: {
    display: "grid",
    gridTemplateColumns: "60px 120px 80px 120px 60px",
    alignItems: "center",
    marginBottom: 4,
  },

  colOutLeft: { textAlign: "right", color: "#60a5fa" },
  colLeft: { textAlign: "right", color: "#60a5fa" },
  colCenter: { textAlign: "center", fontWeight: "bold", fontSize: 18, fontVariantNumeric: "tabular-nums" },
  colRight: { textAlign: "left", color: "#f87171" },
  colOutRight: { textAlign: "left", color: "#f87171" },

  section: { textAlign: "center", margin: "8px 0", fontWeight: "bold" },

  stats: { display: "grid", gridTemplateColumns: "1fr 1fr", padding: 6 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, fontSize: 12 },

  sectionBtns: { display: "flex", justifyContent: "center", gap: 10 },

  control: { background: "#111", padding: 8 },
  row: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 },
  grid: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 },

  num: { padding: 12, fontSize: 16, background: "#222", color: "#fff" },

  blue: { background: "#2563eb", padding: 12, color: "#fff" },
  blueSub: { background: "#3b82f6", padding: 12, color: "#fff" },
  red: { background: "#dc2626", padding: 12, color: "#fff" },
  redSub: { background: "#ef4444", padding: 12, color: "#fff" },

  bottomActions: { display: "flex", justifyContent: "space-around", padding: 10 },

  infoBox: { marginTop: 40, display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 8 },
  teamRow: { display: "grid", gridTemplateColumns: "1fr 50px 1fr" },
  teamInput: { textAlign: "center" },
  vs: { textAlign: "center" },
  startBtn: { marginTop: 10 },
};
