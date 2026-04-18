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
  const [half, setHalf] = useState("前半");

  const [historyList, setHistoryList] = useState([]);

  const timelineRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    timelineRef.current?.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [events]);

  // ■ イベント追加
  const addEvent = (team, type, number) => {
    setEvents((prev) => {
      const list = [...prev, { team, type, number, half }];
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

  // ■ スコア計算
  const calc = () => {
    let first = { b: 0, r: 0 };
    let second = { b: 0, r: 0 };

    events.forEach((e) => {
      if (e.type === "goal") {
        if (e.half === "前半") {
          if (e.team === "blue") first.b++;
          else second.r += 0;
        }
        if (e.half === "後半") {
          if (e.team === "blue") second.b++;
        }
        if (e.team === "red") {
          if (e.half === "前半") first.r++;
          else second.r++;
        }
      }
    });

    return {
      first,
      second,
      total: {
        b: first.b + second.b,
        r: first.r + second.r,
      },
    };
  };

  const score = calc();

  // ■ 保存
  const saveGame = async () => {
    const data = { info, events };
    const list = JSON.parse(localStorage.getItem("games") || "[]");
    list.push(data);
    localStorage.setItem("games", JSON.stringify(list));
    setHistoryList(list);

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const loadHistory = () => {
    const list = JSON.parse(localStorage.getItem("games") || "[]");
    setHistoryList(list);
  };

  const selectGame = (g) => {
    setInfo(g.info);
    setEvents(g.events);
    setStarted(true);
  };

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
          <button onClick={loadHistory}>履歴を見る</button>

          {historyList.map((g, i) => (
            <div key={i} onClick={() => selectGame(g)}>
              {g.info.date} {g.info.home} vs {g.info.away}
            </div>
          ))}
        </div>
      )}

      {started && (
        <>
          {/* ヘッダー */}
          <div style={styles.header}>
            <div>{info.date} {info.round}</div>
            <div>{info.home} vs {info.away}</div>
            <div>合計 {score.total.b}-{score.total.r}</div>
            <div>前半 {score.first.b}-{score.first.r}</div>
            <div>後半 {score.second.b}-{score.second.r}</div>

            <div>
              <button onClick={() => setHalf("前半")}>前半</button>
              <button onClick={() => setHalf("後半")}>後半</button>
            </div>
          </div>

          {/* 履歴 */}
          <div ref={captureRef} style={styles.timeline}>
            {events.map((e, i) => (
              <div key={i} style={styles.row}>
                <div style={styles.leftOut}>{e.team === "blue" && (e.type === "out" || e.type === "in") && `#${e.number}`}</div>
                <div style={styles.left}>{e.team === "blue" && `#${e.number}`}</div>
                <div style={styles.center}>{e.score}</div>
                <div style={styles.right}>{e.team === "red" && `#${e.number}`}</div>
                <div style={styles.rightOut}>{e.team === "red" && (e.type === "out" || e.type === "in") && `#${e.number}`}</div>
              </div>
            ))}
          </div>

          {/* 下 */}
          <div style={styles.bottom}>
            <div style={styles.stats}>
              <div>{blueList.map((p,i)=><div key={i}>#{p.num} {p.count}</div>)}</div>
              <div>{redList.map((p,i)=><div key={i}>#{p.num} {p.count}</div>)}</div>
            </div>

            <div style={styles.btnRow}>
              <button onClick={()=>setMode("blue-goal")}>青G</button>
              <button onClick={()=>setMode("blue-miss")}>青M</button>
              <button onClick={()=>setMode("red-goal")}>赤G</button>
              <button onClick={()=>setMode("red-miss")}>赤M</button>

              <button onClick={()=>setMode("blue-out")}>青OUT</button>
              <button onClick={()=>setMode("blue-in")}>青IN</button>
              <button onClick={()=>setMode("red-out")}>赤OUT</button>
              <button onClick={()=>setMode("red-in")}>赤IN</button>
            </div>

            <div style={styles.grid}>
              {numbers.map(n=>(
                <button key={n} onClick={()=>{
                  if(!mode)return;
                  const [t,ty]=mode.split("-");
                  addEvent(t,ty,n);
                }}>{n}</button>
              ))}
            </div>

            <div>
              <button onClick={undo}>戻る</button>
              <button onClick={saveGame}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container:{
    background:"#0a0a0a",
    color:"#fff",
    height:"100vh",
    display:"flex",
    flexDirection:"column",
  },

  header:{
    position:"sticky",
    top:0,
    background:"#000",
    textAlign:"center",
    padding:8,
  },

  timeline:{
    flex:1,
    overflowY:"auto",
    background:
      "radial-gradient(circle at center,#1f2937 0%,#0a0a0a 70%)",
    padding:6,
  },

  row:{
    display:"grid",
    gridTemplateColumns:"50px 100px 70px 100px 50px",
    fontSize:12,
  },

  leftOut:{textAlign:"right",color:"#60a5fa"},
  left:{textAlign:"right",color:"#60a5fa"},
  center:{textAlign:"center"},
  right:{textAlign:"left",color:"#f87171"},
  rightOut:{textAlign:"left",color:"#f87171"},

  bottom:{
    position:"sticky",
    bottom:0,
    background:"#000",
    padding:6,
  },

  stats:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr",
    fontSize:10,
  },

  btnRow:{
    display:"grid",
    gridTemplateColumns:"repeat(4,1fr)",
    gap:3,
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(5,1fr)",
    gap:3,
  },

  infoBox:{
    marginTop:40,
    display:"flex",
    flexDirection:"column",
    gap:10,
  },
};
