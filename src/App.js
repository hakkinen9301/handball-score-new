import { useState, useRef, useEffect } from "react";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  useEffect(() => {
    const hist = localStorage.getItem("match_history");
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  useEffect(() => {
    if (!started) return;
    localStorage.setItem("current_match", JSON.stringify({ info, events }));
  }, [events, info, started]);

  // ===== スコア =====
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

  // ===== イベント追加 =====
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

  const addSection = (label) => {
    setEvents(prev => [...prev, { type: "section", label }]);

    // ★試合終了で自動保存
    if (label === "試合終了") autoSave();
  };

  const undo = () => setEvents(prev => prev.slice(0, -1));

  // ===== 履歴 =====
  const makeKey = () =>
    `${info.date}_${info.round}_${info.home}_${info.away}`;

  const autoSave = () => {
    const key = makeKey();
    const newHistory = [
      { key, info, events },
      ...history.filter(h => h.key !== key)
    ].sort((a, b) => (a.info.date < b.info.date ? 1 : -1));

    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
  };

  const save = () => {
    autoSave();
    alert("履歴に保存しました");
  };

  const deleteHistory = (key) => {
    if (!window.confirm("削除しますか？")) return;
    const newHistory = history.filter(h => h.key !== key);
    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
  };

  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
  };

  const resetToForm = () => {
    localStorage.removeItem("current_match");
    setEvents([]);
    setStarted(false);
  };

  // ===== 画像保存（前半・後半）=====
  const saveImage = async () => {
    if (!window.html2canvas) {
      alert("html2canvasが未読込");
      return;
    }

    const sections = ["前半", "後半"];

    for (let sec of sections) {
      let section = "前半";
      const filtered = events.filter(e => {
        if (e.type === "section") section = e.label;
        return section === sec && e.type !== "section";
      });

      const div = document.createElement("div");
      div.style.background = "#000";
      div.style.color = "#fff";
      div.style.padding = "40px 20px"; // 余白

      div.innerHTML = `
        <div style="text-align:center;margin-bottom:10px">
          ${info.date} ${info.round}<br/>
          ${info.home} vs ${info.away}<br/>
          ${sec} ${calcScore(sec)}
        </div>
        ${filtered.map(e=>{
          const mark =
            e.type==="goal"?(e.team==="blue"?"🔵":"🔴"):
            e.type==="miss"?"❌":
            e.type==="out"?"⛔":"↩";

          return `<div>${e.team==="blue"?"#"+e.number:""} ${mark} ${e.team==="red"?"#"+e.number:""} ${e.score}</div>`;
        }).join("")}
      `;

      document.body.appendChild(div);

      const canvas = await window.html2canvas(div, { scale: 2 });
      const link = document.createElement("a");
      link.download = `${sec}.png`;
      link.href = canvas.toDataURL();
      link.click();

      document.body.removeChild(div);
    }
  };

  // ===== 得点集計（混在防止済み）=====
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
                  {h.info.date} / {h.info.round} / {h.info.home} vs {h.info.away}
                </button>
                <button onClick={()=>deleteHistory(h.key)}>削除</button>
              </div>
            ))}
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
                  {Array.from({length:4}).map((_,i)=>{
                    const p = blueList[r*4 + i];
                    return <div key={i}>#{p?.num||""} <span style={{color:"#60a5fa"}}>{p?.count||""}</span></div>
                  })}
                  {Array.from({length:4}).map((_,i)=>{
                    const p = redList[r*4 + i];
                    return <div key={i}>#{p?.num||""} <span style={{color:"#f87171"}}>{p?.count||""}</span></div>
                  })}
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
              <button onClick={resetToForm}>入力に戻る</button>
              <button onClick={saveImage}>画像保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = { /* ←ここはあなたの元コードそのまま（省略せず使ってOK） */ };
