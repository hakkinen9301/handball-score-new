import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);
  const [half, setHalf] = useState("first");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  const addEvent = (team, type, number) => {
    if (!started) return;

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

  const calcScore = (targetHalf = null) => {
    let b = 0, r = 0;
    events.forEach(e => {
      if (e.type === "goal" && (!targetHalf || e.half === targetHalf)) {
        if (e.team === "blue") b++;
        if (e.team === "red") r++;
      }
    });
    return `${b}-${r}`;
  };

  const undo = () => setEvents(prev => prev.slice(0, -1));

  const numbers = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      {!started && (
        <div style={styles.infoBox}>
          <input type="date" style={styles.input} onChange={(e)=>setInfo({...info,date:e.target.value})}/>
          <input placeholder="何回戦" style={styles.input} onChange={(e)=>setInfo({...info,round:e.target.value})}/>
          <div style={styles.teamRow}>
            <input placeholder="チームA" style={styles.teamInput} onChange={(e)=>setInfo({...info,home:e.target.value})}/>
            <div style={styles.vs}>vs</div>
            <input placeholder="チームB" style={styles.teamInput} onChange={(e)=>setInfo({...info,away:e.target.value})}/>
          </div>
          <button style={styles.startBtn} onClick={()=>setStarted(true)}>試合開始</button>
        </div>
      )}

      {started && (
        <>
          <div style={styles.header}>
            <div>{info.date}　{info.round}</div>
            <div style={styles.title}>{info.home} vs {info.away}</div>
            <div style={styles.scoreRow}>
              前半 {calcScore("first")}　後半 {calcScore("second")}　合計 {calcScore()}
            </div>
            <div style={styles.halfBtns}>
              <button onClick={()=>setHalf("first")}>前半</button>
              <button onClick={()=>setHalf("second")}>後半</button>
              <button onClick={()=>setHalf("end")}>終了</button>
            </div>
          </div>

          <div style={styles.timeline}>
            {events.map((e,i)=>{
              const mark =
                e.type==="goal" ? (e.team==="blue"?"🔵":"🔴") :
                e.type==="miss" ? "❌" :
                e.type==="out" ? "⛔" : "↩";

              return(
                <div key={i} style={styles.rowLine}>
                  <div style={styles.left}>
                    {e.team==="blue" && (e.type==="out"||e.type==="in") && `#${e.number} ${mark}`}
                  </div>
                  <div style={styles.centerLeft}>
                    {e.team==="blue" && (e.type==="goal"||e.type==="miss") && `#${e.number} ${mark}`}
                  </div>
                  <div style={styles.center}>{e.score}</div>
                  <div style={styles.centerRight}>
                    {e.team==="red" && (e.type==="goal"||e.type==="miss") && `${mark} #${e.number}`}
                  </div>
                  <div style={styles.right}>
                    {e.team==="red" && (e.type==="out"||e.type==="in") && `${mark} #${e.number}`}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>

          <div style={styles.control}>
            <div style={styles.row}>
              <button style={styles.blue} onClick={()=>setMode("blue-goal")}>青G</button>
              <button style={styles.blueSub} onClick={()=>setMode("blue-miss")}>青M</button>
              <button style={styles.red} onClick={()=>setMode("red-goal")}>赤G</button>
              <button style={styles.redSub} onClick={()=>setMode("red-miss")}>赤M</button>
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
          </div>

          <div style={styles.bottomActions}>
            <button onClick={undo}>↩ 戻る</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container:{background:"#0a0a0a",color:"#fff",height:"100vh",display:"flex",flexDirection:"column"},
  header:{textAlign:"center",padding:10,borderBottom:"1px solid #333"},
  title:{fontSize:20,fontWeight:"bold"},
  scoreRow:{marginTop:4},
  halfBtns:{marginTop:6,display:"flex",justifyContent:"center",gap:10},

  timeline:{flex:1,overflowY:"auto",padding:10},

  rowLine:{
    display:"grid",
    gridTemplateColumns:"48px 96px 64px 96px 48px",
    marginBottom:4,
    maxWidth:420,
    width:"100%",
    margin:"0 auto",
    alignItems:"center"
  },

  left:{textAlign:"center",color:"#60a5fa",whiteSpace:"nowrap"},
  centerLeft:{textAlign:"right",color:"#60a5fa",whiteSpace:"nowrap"},
  center:{textAlign:"center",fontWeight:"bold"},
  centerRight:{textAlign:"left",color:"#f87171",whiteSpace:"nowrap"},
  right:{textAlign:"center",color:"#f87171",whiteSpace:"nowrap"},

  control:{background:"#111",padding:8},

  row:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:5},
  grid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5},

  num:{padding:12,fontSize:16,background:"#222",color:"#fff"},
  blue:{background:"#2563eb",padding:12,color:"#fff"},
  blueSub:{background:"#3b82f6",padding:12,color:"#fff"},
  red:{background:"#dc2626",padding:12,color:"#fff"},
  redSub:{background:"#ef4444",padding:12,color:"#fff"},

  bottomActions:{display:"flex",justifyContent:"space-around",padding:10,background:"#000"},

  infoBox:{marginTop:40,display:"flex",flexDirection:"column",gap:10},
  input:{padding:8},
  teamRow:{display:"grid",gridTemplateColumns:"1fr 50px 1fr"},
  teamInput:{textAlign:"center"},
  vs:{textAlign:"center"},
  startBtn:{marginTop:10}
};
