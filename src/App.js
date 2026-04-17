import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({
    date: "",
    round: "",
    home: "",
    away: "",
  });

  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);

  const bottomRef = useRef(null);

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

  const totalBlue = firstHalf.blue + secondHalf.blue;
  const totalRed = firstHalf.red + secondHalf.red;

  const save = () => {
    let text = "";
    text += `${info.date}\n${info.round}\n${info.home} vs ${info.away}\n\n`;
    text += `前半 ${firstHalf.blue}-${firstHalf.red}\n`;
    text += `後半 ${secondHalf.blue}-${secondHalf.red}\n`;
    text += `合計 ${totalBlue}-${totalRed}\n\n`;

    events.forEach((e) => {
      if (e.type === "section") {
        text += `ーー ${e.label} ーー\n`;
        return;
      }

      let left = "";
      let right = "";

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

      if (e.team === "blue") left = `#${e.number} ${mark}`;
      if (e.team === "red") right = `${mark} #${e.number}`;

      text += `${left.padEnd(12, " ")} ${e.score} ${right}\n`;
    });

    navigator.clipboard.writeText(text);
    alert("コピーしました");
  };

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
          <button style={styles.startBtn} onClick={() => setStarted(true)}>試合開始</button>
        </div>
      )}

      {started && (
        <>
          <div style={styles.header}>
            <div>{info.date}</div>
            <div>{info.round}</div>
            <div style={styles.title}>{info.home} vs {info.away}</div>
            <div>前半 {firstHalf.blue}-{firstHalf.red}</div>
            <div>後半 {secondHalf.blue}-{secondHalf.red}</div>
            <div style={{ fontWeight: "bold" }}>合計 {totalBlue}-{totalRed}</div>
          </div>

          <div style={styles.scoreList}>
            {events.map((e, i) => {
              if (e.type === "section") {
                return <div key={i} style={styles.section}>{e.label}</div>;
              }

              let left = "";
              let right = "";

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

              if (e.team === "blue") left = `#${e.number} ${mark}`;
              if (e.team === "red") right = `${mark} #${e.number}`;

              return (
                <div key={i} style={styles.row}>
                  <div style={styles.left}>{left}</div>
                  <div style={styles.score}>{e.score}</div>
                  <div style={styles.right}>{right}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

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

          <div style={styles.controls}>
            {numbers.map((n) => (
              <button key={n} onClick={() => addEvent("blue", "goal", n)}>{n}</button>
            ))}
          </div>

          <div style={styles.bottom}>
            <button onClick={() => addSection("前半開始")}>前半</button>
            <button onClick={() => addSection("後半開始")}>後半</button>
            <button onClick={undo}>戻る</button>
            <button onClick={save}>保存</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { background: "black", color: "white", height: "100vh", textAlign: "center" },
  header: { padding: 10 },
  title: { fontSize: 20, fontWeight: "bold" },
  scoreList: { height: "40vh", overflowY: "auto" },
  row: { display: "flex", justifyContent: "space-between", padding: 4 },
  left: { width: "30%" },
  score: { width: "40%", textAlign: "center" },
  right: { width: "30%", textAlign: "right" },
  section: { margin: 10, fontWeight: "bold" },
  stats: { display: "flex", justifyContent: "space-around" },
  controls: { display: "flex", flexWrap: "wrap" },
  bottom: { position: "fixed", bottom: 0, width: "100%" },
};
