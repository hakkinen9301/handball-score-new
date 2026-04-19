import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  useEffect(() => {
    const saved = localStorage.getItem("matches");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

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

  const undo = () => setEvents((prev) => prev.slice(0, -1));

  const save = async () => {
    try {
      const newHistory = [
        { info, events, id: Date.now() },
        ...history
      ];
      setHistory(newHistory);
      localStorage.setItem("matches", JSON.stringify(newHistory));

      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2
      });

      const link = document.createElement("a");
      link.download = "score.png";
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      alert("画像保存失敗（履歴は保存済み）");
    }
  };

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

            {history.length > 0 && (
              <div style={{marginTop:20}}>
                {history.map(h=>(
                  <div key={h.id}
                    onClick={()=>{
                      setInfo(h.info);
                      setEvents(h.events);
                      setStarted(true);
                    }}
                    style={styles.historyItem}>
                    {h.info.date} {h.info.home} vs {h.info.away}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {started && (
        <>
          <div ref={captureRef}>
            <div style={styles.header}>
              <div>{info.date} {info.round}</div>
              <div>{info.home} vs {info.away}</div>
            </div>

            <div style={styles.timeline}>
              {events.map((e,i)=>{
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
  header:{textAlign:"center",padding:8},
  timeline:{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center"},
  row:{display:"grid",gridTemplateColumns:"50px 100px 60px 100px 50px",width:"100%",maxWidth:420},
  c1:{textAlign:"center",color:"#60a5fa",whiteSpace:"nowrap"},
  c2:{textAlign:"right",color:"#60a5fa"},
  c3:{textAlign:"center"},
  c4:{textAlign:"left",color:"#f87171"},
  c5:{textAlign:"center",color:"#f87171"},
  bottom:{background:"#000",padding:6},
  btnRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4},
  grid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4},
  num:{padding:12,background:"#222",color:"#fff"},
  blue:{background:"#2563eb",color:"#fff"},
  blueSub:{background:"#3b82f6",color:"#fff"},
  red:{background:"#dc2626",color:"#fff"},
  redSub:{background:"#ef4444",color:"#fff"},
  actions:{display:"flex",justifyContent:"space-around"},
  startWrap:{flex:1,display:"flex",justifyContent:"center",alignItems:"center"},
  startBox:{display:"flex",flexDirection:"column",gap:10,width:"80%"},
  bigInput:{padding:14},
  startBtn:{padding:14,background:"#2563eb",color:"#fff"},
  historyItem:{padding:6,borderBottom:"1px solid #333"}
};
