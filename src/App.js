import { useState, useEffect, useRef } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [half, setHalf] = useState("前半");
  const [selecting, setSelecting] = useState(null);
  const [matches, setMatches] = useState([]);
  const [locked, setLocked] = useState(false); // 試合ロック
  const [cooldown, setCooldown] = useState(false); // 連打防止

  const logRef = useRef(null);

  const [matchInfo, setMatchInfo] = useState({
    date: "",
    homeName: "",
    awayName: "",
    round: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("matches");
    if (saved) setMatches(JSON.parse(saved));
  }, []);

  // 自動スクロール
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const saveMatch = () => {
    const newMatch = { id: Date.now(), matchInfo, events, score };
    const updated = [...matches, newMatch];
    setMatches(updated);
    localStorage.setItem("matches", JSON.stringify(updated));
    alert("保存しました");
  };

  const loadMatch = (m) => {
    setMatchInfo(m.matchInfo);
    setEvents(m.events);
    setScore(m.score);
    setLocked(true);
  };

  const resetMatch = () => {
    setEvents([]);
    setScore({ home: 0, away: 0 });
    setHalf("前半");
    setMatchInfo({ date: "", homeName: "", awayName: "", round: "" });
    setLocked(false);
  };

  const addEvent = (team, event, player) => {
    if (cooldown) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), 300);

    let newScore = { ...score };
    if (event === "goal") {
      if (team === "home") newScore.home += 1;
      else newScore.away += 1;
    }

    const newEvent = {
      id: Date.now(),
      team,
      event,
      player,
      score: `${newScore.home}-${newScore.away}`,
      half,
    };

    setScore(newScore);
    setEvents([...events, newEvent]);
    setSelecting(null);
  };

  const undo = () => {
    if (events.length === 0) return;
    const last = events[events.length - 1];
    let newScore = { ...score };

    if (last.event === "goal") {
      if (last.team === "home") newScore.home -= 1;
      else newScore.away -= 1;
    }

    setScore(newScore);
    setEvents(events.slice(0, -1));
  };

  const exportCSV = () => {
    const rows = [
      ["日付","回戦","自チーム","相手","順番","チーム","背番号","イベント","スコア"],
      ...events.map((e,i)=>[
        matchInfo.date, matchInfo.round, matchInfo.homeName, matchInfo.awayName,
        i+1, e.team, e.player, e.event, e.score
      ])
    ];

    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "match.csv";
    a.click();
  };

  const goalStats = events.reduce((acc,e)=>{
    if(e.event==="goal") acc[e.player]=(acc[e.player]||0)+1;
    return acc;
  },{});

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* 試合情報 */}
      <div className="bg-white p-2 grid grid-cols-2 gap-2 text-sm">
        <input type="date" disabled={locked} value={matchInfo.date} onChange={(e)=>setMatchInfo({...matchInfo,date:e.target.value})} className="border rounded p-1"/>
        <input placeholder="回戦" disabled={locked} value={matchInfo.round} onChange={(e)=>setMatchInfo({...matchInfo,round:e.target.value})} className="border rounded p-1"/>
        <input placeholder="自チーム" disabled={locked} value={matchInfo.homeName} onChange={(e)=>setMatchInfo({...matchInfo,homeName:e.target.value})} className="border rounded p-1"/>
        <input placeholder="相手" disabled={locked} value={matchInfo.awayName} onChange={(e)=>setMatchInfo({...matchInfo,awayName:e.target.value})} className="border rounded p-1"/>
      </div>

      {/* スコア */}
      <div className="bg-white shadow p-3 text-center">
        <div className="text-xs">{matchInfo.date} {matchInfo.round}</div>
        <div className="text-sm">{matchInfo.homeName||"自"} vs {matchInfo.awayName||"相"}</div>
        <div className="text-4xl font-bold">🔵 {score.home} - {score.away} 🔴</div>
        <div>{half}</div>
      </div>

      {/* ログ */}
      <div ref={logRef} className="flex-1 overflow-y-auto p-2">
        {events.map((e,i)=>(
          <div key={e.id} className="bg-white rounded-xl p-3 mb-2 flex justify-between text-lg">
            <span>{i+1}. {e.team==="home"?"🔵":"🔴"} #{e.player} {e.event==="goal"?"⚽️":"❌"}</span>
            <span className="text-gray-500">{e.score}</span>
          </div>
        ))}
      </div>

      {/* ゴール集計 */}
      <div className="bg-white p-2 text-sm">
        {Object.entries(goalStats).map(([p,c])=> <span key={p} className="mr-2">#{p}:{c}</span>)}
      </div>

      {/* 入力 */}
      {!selecting && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-white sticky bottom-0">
          <button className="bg-blue-500 text-white rounded-2xl p-5 text-xl" onClick={()=>setSelecting({team:"home",event:"goal"})}>🔵 ゴール</button>
          <button className="bg-red-500 text-white rounded-2xl p-5 text-xl" onClick={()=>setSelecting({team:"away",event:"goal"})}>🔴 ゴール</button>
          <button className="bg-blue-200 rounded-2xl p-5 text-xl" onClick={()=>setSelecting({team:"home",event:"miss"})}>🔵 ミス</button>
          <button className="bg-red-200 rounded-2xl p-5 text-xl" onClick={()=>setSelecting({team:"away",event:"miss"})}>🔴 ミス</button>
        </div>
      )}

      {selecting && (
        <div className="grid grid-cols-5 gap-2 p-2 bg-white">
          {Array.from({length:15},(_,i)=>i+1).map(n=> (
            <button key={n} className="bg-gray-200 rounded-xl p-4 text-xl" onClick={()=>addEvent(selecting.team,selecting.event,n)}>#{n}</button>
          ))}
        </div>
      )}

      {/* 操作 */}
      <div className="flex justify-between p-2 bg-white">
        <button onClick={undo}>↩️</button>
        <button onClick={()=>setHalf(half==="前半"?"後半":"前半")}>切替</button>
        <button onClick={()=>setLocked(true)}>開始</button>
        <button onClick={saveMatch}>保存</button>
        <button onClick={resetMatch}>新規</button>
        <button onClick={exportCSV}>CSV</button>
      </div>

      {/* 一覧 */}
      <div className="bg-gray-200 p-2 overflow-x-auto whitespace-nowrap">
        {matches.map(m=> (
          <div key={m.id} onClick={()=>loadMatch(m)} className="inline-block bg-white p-2 m-1 rounded shadow text-xs">
            <div>{m.matchInfo.date}</div>
            <div>{m.matchInfo.homeName} vs {m.matchInfo.awayName}</div>
            <div>{m.score.home}-{m.score.away}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
