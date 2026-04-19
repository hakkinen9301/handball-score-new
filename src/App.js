import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);

  // ★追加
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);

  // 自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  // ★初期ロード
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

  // ★自動保存
  useEffect(() => {
    if (!started) return;
    localStorage.setItem(
      "current_match",
      JSON.stringify({ info, events })
    );
  }, [events, info, started]);

  // スコア計算
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

  // イベント追加
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

  // ★保存（履歴）
  const save = () => {
    const newHistory = [
      { info, events, date: new Date().toISOString() },
      ...history
    ];
    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
    alert("履歴に保存しました");
  };

  // ★履歴読込
  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
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

            {/* ★履歴 */}
            {history.length > 0 && (
              <div style={{marginTop:20}}>
                <div>履歴</div>
                {history.map((h,i)=>(
                  <div key={i}>
                    <button onClick={()=>loadMatch(h)}>
                      {h.info.home} vs {h.info.away}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {started && (
        <>
          <div style={styles.header}>
            <div>{info.date} {info.round}</div>
            <div>{info.home} vs {info.away}</div>

            <div style={styles.scoreRow}>
              <button onClick={()=>addSection("前半")}>前半</button>
              <span>{calcScore("前半")}</span>
              <button onClick={()=>addSection("後半")}>後半</button>
              <span>{calcScore("後半")}</span>
              <button onClick={()=>addSection("試合終了")}>終了</button>
              <span>{calcScore("total")}</span>
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

          <div style={styles.bottom}>
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
    fontFamily:"system-ui, -apple-system, sans-serif"
  },

  header:{position:"sticky",top:0,background:"#000",textAlign:"center",padding:8},

  scoreRow:{display:"flex",justifyContent:"center",gap:6,fontSize:12},

  timeline:{flex:1,overflowY:"auto",padding:8},

  row:{
    display:"grid",
    gridTemplateColumns:"40px 90px 70px 90px 40px",
    alignItems:"center",
    height:22
  },

  c1:{textAlign:"center",color:"#60a5fa",whiteSpace:"nowrap"},
  c2:{textAlign:"center",color:"#60a5fa",whiteSpace:"nowrap"},
  c3:{textAlign:"center",fontWeight:"bold"},
  c4:{textAlign:"center",color:"#f87171",whiteSpace:"nowrap"},
  c5:{textAlign:"center",color:"#f87171",whiteSpace:"nowrap"},

  section:{textAlign:"center",margin:"6px 0",color:"#aaa"},

  bottom:{position:"sticky",bottom:0,background:"#000",padding:6},

  stats:{marginBottom:4},
  statRow:{display:"grid",gridTemplateColumns:"repeat(8,1fr)",fontSize:12,textAlign:"center"},

  btnRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:4},

  grid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4},

  num:{padding:12,fontSize:16,background:"#222",color:"#fff"},

  blue:{background:"#2563eb",color:"#fff",padding:10},
  blueSub:{background:"#3b82f6",color:"#fff",padding:10},
  red:{background:"#dc2626",color:"#fff",padding:10},
  redSub:{background:"#ef4444",color:"#fff",padding:10},

  actions:{display:"flex",justifyContent:"space-around",marginTop:4},

  startWrap:{
    height:"100%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },

  startBox:{
    display:"flex",
    flexDirection:"column",
    gap:12,
    width:"80%"
  },

  bigInput:{padding:14,fontSize:16},

  startBtn:{padding:14,fontSize:16,background:"#2563eb",color:"#fff"}
};
