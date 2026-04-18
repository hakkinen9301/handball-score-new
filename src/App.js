import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);

  const timelineRef = useRef(null);
  const captureRef = useRef(null);

  // ■ 自動スクロール
  useEffect(() => {
    timelineRef.current?.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [events]);

  // ■ イベント追加
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

  // ■ 得点者
  const goalStats = events.reduce((acc, e) => {
    if (e.type === "goal") {
      const key = `${e.team}-${e.number}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const makeList = (team) =>
    Object.entries(goalStats)
      .filter(([k]) => k.startsWith(team))
      .map(([k, v]) => ({ num: Number(k.split("-")[1]), count: v }))
      .sort((a, b) => a.num - b.num)
      .slice(0, 8);

  const blueList = makeList("blue");
  const redList = makeList("red");

  // ■ 保存（画像）
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
          <input type="date" onChange={(e) => setInfo({ ...info, date: e.target.value })}/>
          <input placeholder="何回戦" onChange={(e) => setInfo({ ...info, round: e.target.value })}/>
          <div>
            <input placeholder="チームA" onChange={(e) => setInfo({ ...info, home: e.target.value })}/>
            vs
            <input placeholder="チームB" onChange={(e) => setInfo({ ...info, away: e.target.value })}/>
          </div>
          <button onClick={() => setStarted(true)}>開始</button>
        </div>
      )}

      {started && (
        <>
          {/* ヘッダー */}
          <div style={styles.header}>
            <div>{info.date} {info.round}</div>
            <div style={{ fontSize: 18 }}>{info.home} vs {info.away}</div>

            <div style={styles.sectionBtns}>
              <button onClick={() => addSection("前半")}>前半</button>
              <button onClick={() => addSection("後半")}>後半</button>
              <button onClick={() => addSection("試合終了")}>終了</button>
            </div>
          </div>

          {/* 履歴 */}
          <div ref={captureRef} style={styles.timeline}>
            <div ref={timelineRef}>
              {events.map((e, i) => {
                if (e.type === "section") {
                  return (
                    <div key={i} style={styles.section}>
                      ーー {e.label} ーー
                    </div>
                  );
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
                    <div style={styles.center}>{e.score}</div>
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
          </div>

          {/* 下部 */}
          <div style={styles.bottom}>
            {/* 得点 */}
            <div style={styles.stats}>
              <div style={styles.statBox}>
                {blueList.map((p, i) => (
                  <div key={i}>#{p.num} <span style={{ color: "#60a5fa" }}>{p.count}</span></div>
                ))}
              </div>
              <div style={styles.statBox}>
                {redList.map((p, i) => (
                  <div key={i}>#{p.num} <span style={{ color: "#f87171" }}>{p.count}</span></div>
                ))}
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
                    const [t, ty] = mode.split("-");
                    addEvent(t, ty, n);
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
  container:{background:"#0a0a0a",color:"#fff",height:"100vh",display:"flex",flexDirection:"column"},
  header:{position:"sticky",top:0,background:"#000",textAlign:"center",padding:8},
  timeline:{flex:1,overflowY:"auto",padding:10},
  row:{display:"grid",gridTemplateColumns:"50px 120px 80px 120px 50px",fontSize:14},
  leftOut:{textAlign:"right",color:"#60a5fa"},
  left:{textAlign:"right",color:"#60a5fa"},
  center:{textAlign:"center",fontWeight:"bold"},
  right:{textAlign:"left",color:"#f87171"},
  rightOut:{textAlign:"left",color:"#f87171"},
  section:{textAlign:"center",margin:"8px 0",color:"#aaa"},
  bottom:{position:"sticky",bottom:0,background:"#000",padding:8},
  stats:{display:"grid",gridTemplateColumns:"1fr 1fr",marginBottom:6},
  statBox:{display:"grid",gridTemplateColumns:"1fr 1fr",fontSize:12},
  btnRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:5},
  grid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5},
  num:{padding:16,fontSize:18,background:"#222",color:"#fff"},
  blue:{background:"#2563eb",color:"#fff",padding:12},
  blueSub:{background:"#3b82f6",color:"#fff",padding:12},
  red:{background:"#dc2626",color:"#fff",padding:12},
  redSub:{background:"#ef4444",color:"#fff",padding:12},
  actions:{display:"flex",justifyContent:"space-around",marginTop:6},
  sectionBtns:{display:"flex",justifyContent:"center",gap:5,marginTop:5},
  infoBox:{marginTop:40,display:"flex",flexDirection:"column",gap:10}
};
