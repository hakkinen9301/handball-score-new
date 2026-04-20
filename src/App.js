import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);
  const captureRef = useRef(null); // ★画像範囲

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

  // 履歴保存（上書き）
  const save = () => {
    const key = `${info.date}_${info.round}_${info.home}_${info.away}`;
    const newHistory = [
      { key, info, events },
      ...history.filter(h => h.key !== key)
    ];
    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
    alert("保存しました");
  };

  const deleteHistory = (key) => {
    const newHistory = history.filter(h => h.key !== key);
    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
  };

  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
  };

  const resetToForm = () => setStarted(false);

  // ★画像保存（完全版）
  const saveImage = async () => {
    if (!window.html2canvas) {
      alert("html2canvas未読込");
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

  // 得点集計
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
              <div key={i}>
                <button onClick={()=>loadMatch(h)}>
                  {h.info.date} {h.info.round} / {h.info.home} vs {h.info.away}
                </button>
                <button onClick={()=>deleteHistory(h.key)}>削除</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {started && (
        <>
          {/* ★ここが画像範囲 */}
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

            {/* ★背番号得点（復活＆画像に含まれる） */}
            <div style={styles.stats}>
              {[0,1].map(r=>(
                <div key={r} style={styles.statRow}>
                  {[...blueList.slice(r*4,(r+1)*4),
                    ...redList.slice(r*4,(r+1)*4)
                  ].map((p,i)=>(
                    <div key={i}>
                      #{p?.num || ""}{" "}
                      <span style={{color:i<4?"#60a5fa":"#f87171"}}>
                        {p?.count || ""}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 下部UI（画像に含まれない） */}
          <div style={styles.bottom}>
            <div style={styles.btnRow}>
              <button style={styles.blue} onClick={()=>setMode("blue-goal")}>青G</button>
              <button style={styles.blueSub} onClick={()=>setMode("blue-miss")}>青M</button>
              <button style={styles.red} onClick={()=>setMode("red-goal")}>赤G</button>
              <button style={styles.redSub} onClick={()=>setMode("red-miss")}>赤M</button>

              <button style={styles.blueSub} onClick={()=>setMode("blue-out")}>青OUT</button>
              <button style={styles.blueSub} onClick={()=>setMode("blue-in")}>青IN</button>
              <button style={styles.redSub} onClick={()=>setMode("red-out")}>赤OUT</button>
              <button style={styles.redSub} onClick={()=>setMode("red-in")}>赤IN</button>
            </div>

            <div style={styles.grid}>
              {numbers.map(n=>(
                <button key={n} style={styles.num}
                  onClick={()=>{
                    if(!mode)return;
                    const [t,ty]=mode.split("-");
                    addEvent(t,ty,n);
                  }}>{n}</button>
              ))}
            </div>

            <div style={styles.actions}>
              <button onClick={undo}>戻る</button>
              <button onClick={save}>履歴保存</button>
              <button onClick={resetToForm}>入力に戻る</button>
              <button onClick={saveImage}>画像保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container:{background:"#0a0a0a",color:"#fff",height:"100vh",display:"flex",flexDirection:"column"},
  header:{position:"sticky",top:0,background:"#000",textAlign:"center"},
  scoreRow:{display:"flex",justifyContent:"center",gap:6,fontSize:12},
  timeline:{flex:1,overflowY:"auto"},
  row:{
    display:"grid",
    gridTemplateColumns:"40px 90px 70px 90px 40px",
    whiteSpace:"nowrap"
  },
  c1:{textAlign:"center",color:"#60a5fa"},
  c2:{textAlign:"right",color:"#60a5fa"},
  c3:{textAlign:"center"},
  c4:{textAlign:"left",color:"#f87171"},
  c5:{textAlign:"center",color:"#f87171"},
  section:{textAlign:"center"},
  stats:{padding:8},
  statRow:{display:"grid",gridTemplateColumns:"repeat(8,1fr)",textAlign:"center"},
  bottom:{background:"#000"},
  btnRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)"},
  grid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)"},
  num:{padding:12}
};
