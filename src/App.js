import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);
  const captureRef = useRef(null); // ★画像用

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  useEffect(() => {
    const saved = localStorage.getItem("current_match");
    const hist = localStorage.getItem("match_history");

    if (saved) {
      const data = JSON.parse(saved);
      setInfo(data.info);
      setEvents(data.events);
      setStarted(true);
    }

    if (hist) setHistory(JSON.parse(hist));
  }, []);

  useEffect(() => {
    if (!started) return;
    localStorage.setItem("current_match", JSON.stringify({ info, events }));
  }, [events, info, started]);

  const calcScore = (target) => {
    let b = 0, r = 0;
    let section = "前半";

    events.forEach(e => {
      if (e.type === "section") section = e.label;
      if (e.type === "goal") {
        if (target === "total" || target === section) {
          if (e.team === "blue") b++;
          if (e.team === "red") r++;
        }
      }
    });

    return `${b}-${r}`;
  };

  const addEvent = (team, type, number) => {
    setEvents(prev => {
      const list = [...prev, { team, type, number }];
      let b = 0, r = 0;

      return list.map(e => {
        if (e.type === "goal") {
          if (e.team === "blue") b++;
          if (e.team === "red") r++;
        }
        return { ...e, score: `${b}-${r}` };
      });
    });
  };

  const addSection = (label) =>
    setEvents(prev => [...prev, { type: "section", label }]);

  const undo = () => setEvents(prev => prev.slice(0, -1));

  // ★履歴保存（上書き対応）
  const save = () => {
    const key = `${info.date}_${info.round}_${info.home}_${info.away}`;

    const newHistory = [
      { key, info, events },
      ...history.filter(h => h.key !== key)
    ];

    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
    alert("履歴を保存しました（同一試合は上書き）");
  };

  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
  };

  const resetToForm = () => setStarted(false);

  // ★画像保存（履歴全部＋下部除外）
  const saveImage = async () => {
    if (!window.html2canvas) {
      alert("画像保存の読み込み失敗");
      return;
    }

    const canvas = await window.html2canvas(captureRef.current, {
      backgroundColor: "#000",
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  };

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
        <div style={styles.startWrap}>
          <div style={styles.startBox}>
            <input type="date" style={styles.bigInput}
              onChange={(e)=>setInfo({...info,date:e.target.value})}/>
            <input placeholder="何回戦" style={styles.bigInput}
              onChange={(e)=>setInfo({...info,round:e.target.value})}/>
            <input placeholder="チームA" style={styles.bigInput}
              onChange={(e)=>setInfo({...info,home:e.target.value})}/>
            <input placeholder="チームB" style={styles.bigInput}
              onChange={(e)=>setInfo({...info,away:e.target.value})}/>
            <button style={styles.startBtn} onClick={()=>setStarted(true)}>試合開始</button>

            {history.map((h,i)=>(
              <button key={i} onClick={()=>loadMatch(h)}>
                {h.info.date} {h.info.round} / {h.info.home} vs {h.info.away}
              </button>
            ))}
          </div>
        </div>
      )}

      {started && (
        <>
          <div ref={captureRef}>
            <div style={styles.header}>
              <div>{info.date} {info.round}</div>
              <div>{info.home} vs {info.away}</div>

              <div style={styles.scoreRow}>
                前半 {calcScore("前半")}
                後半 {calcScore("後半")}
                終了 {calcScore("total")}
              </div>
            </div>

            <div style={styles.timeline}>
              {events.map((e,i)=>{
                if(e.type==="section"){
                  return <div key={i} style={styles.section}>ーー {e.label} ーー</div>
                }

                const mark =
                  e.type==="goal" ? (e.team==="blue"?"🔵":"🔴") :
                  e.type==="miss" ? "❌" :
                  e.type==="out" ? "⛔" : "↩";

                return(
                  <div key={i} style={styles.row}>
                    <div style={styles.c1}>
                      {e.team==="blue" && (e.type==="out"||e.type==="in") && `#${e.number} ${mark}`}
                    </div>
                    <div style={styles.c2}>
                      {e.team==="blue" && (e.type==="goal"||e.type==="miss") && `#${e.number} ${mark}`}
                    </div>
                    <div style={styles.c3}>{e.score}</div>
                    <div style={styles.c4}>
                      {e.team==="red" && (e.type==="goal"||e.type==="miss") && `${mark} #${e.number}`}
                    </div>
                    <div style={styles.c5}>
                      {e.team==="red" && (e.type==="out"||e.type==="in") && `${mark} #${e.number}`}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef}/>
            </div>
          </div>

          {/* ↓ここは画像に含まれない */}
          <div style={styles.bottom}>
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

            <div style={styles.actions}>
              <button onClick={undo}>戻る</button>
              <button onClick={save}>履歴保存</button>
              <button onClick={resetToForm}>戻る</button>
              <button onClick={saveImage}>画像保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container:{background:"#000",color:"#fff",height:"100vh",display:"flex",flexDirection:"column"},
  header:{position:"sticky",top:0,background:"#000",textAlign:"center"},
  timeline:{flex:1,overflowY:"auto"},
  row:{
    display:"grid",
    gridTemplateColumns:"40px 90px 70px 90px 40px",
    whiteSpace:"nowrap" // ★2段防止
  },
  c1:{textAlign:"center",color:"#60a5fa"},
  c2:{textAlign:"right",color:"#60a5fa"},
  c3:{textAlign:"center"},
  c4:{textAlign:"left",color:"#f87171"},
  c5:{textAlign:"center",color:"#f87171"},
  bottom:{background:"#000"}
};
