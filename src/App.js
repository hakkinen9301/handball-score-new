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
    localStorage.setItem(
      "current_match",
      JSON.stringify({ info, events })
    );
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

  // ★履歴：同一試合は上書き
  const save = () => {
    const key = `${info.date}_${info.round}_${info.home}_${info.away}`;

    const newHistory = [
      { key, info, events },
      ...history.filter(h => h.key !== key)
    ];

    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
    alert("履歴に保存しました");
  };

  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
  };

  const resetToForm = () => {
    setStarted(false);
  };

  // ★画像保存（UI壊さない版）
  const saveImage = async () => {
    if (!window.html2canvas) {
      alert("画像保存の読み込み失敗");
      return;
    }

    const bottom = document.getElementById("bottom-area");
    if (bottom) bottom.style.display = "none";

    const canvas = await window.html2canvas(document.body, {
      backgroundColor: "#000",
      scale: 2,
    });

    if (bottom) bottom.style.display = "block";

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

            {history.length > 0 && (
              <div style={{marginTop:20}}>
                <div>履歴</div>
                {history.map((h,i)=>(
                  <div key={i}>
                    <button onClick={()=>loadMatch(h)}>
                      {h.info.date} {h.info.round} / {h.info.home} vs {h.info.away}
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

          <div style={styles.bottom} id="bottom-area">
            {/* ここ以下は一切変更なし */}
