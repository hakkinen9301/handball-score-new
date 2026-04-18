import { useEffect, useRef, useState } from "react";

export default function HandballScoreApp() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [phase, setPhase] = useState("前半");
  const [history, setHistory] = useState([]);

  const [homePlayers, setHomePlayers] = useState(Array(8).fill(0));
  const [awayPlayers, setAwayPlayers] = useState(Array(8).fill(0));

  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const addGoal = (team, idx = null) => {
    let newHome = [...homePlayers];
    let newAway = [...awayPlayers];
    let nextHomeScore = homeScore;
    let nextAwayScore = awayScore;

    if (team === "home") {
      nextHomeScore = homeScore + 1;
      setHomeScore(nextHomeScore);
      if (idx !== null) newHome[idx] += 1;
    } else {
      nextAwayScore = awayScore + 1;
      setAwayScore(nextAwayScore);
      if (idx !== null) newAway[idx] += 1;
    }

    setHomePlayers(newHome);
    setAwayPlayers(newAway);

    const newHistory = {
      time: new Date().toLocaleTimeString().slice(0, 8),
      phase,
      team,
      idx,
      score: `${nextHomeScore}-${nextAwayScore}`,
    };
    setHistory([newHistory, ...history]);
  };

  const changePhase = (nextPhase) => {
    setPhase(nextPhase);
    setHistory([{
      type: "phase",
      label: nextPhase,
      time: new Date().toLocaleTimeString().slice(0, 8),
      score: `${homeScore}-${awayScore}`,
    }, ...history]);
  };

  const resetGame = () => {
    if(!confirm("リセットしますか？")) return;
    setHomeScore(0);
    setAwayScore(0);
    setHomePlayers(Array(8).fill(0));
    setAwayPlayers(Array(8).fill(0));
    setPhase("前半");
    setHistory([]);
  };

  // 共通のカードスタイル
  const cardClass = "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden";
  const btnBase = "active:scale-95 transition-all duration-75 font-bold rounded-lg shadow-sm";

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4 bg-gray-50 min-h-screen pb-10">
      {/* メインスコアボード */}
      <div className={cardClass}>
        <div className="p-6 text-center">
          <h1 className="text-xl font-extrabold text-gray-800">ハンドボールスコア</h1>
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 my-2">
            {phase}
          </div>
          <div className="flex justify-around items-center mt-2">
            <div className="text-center">
              <span className="block text-xs text-gray-400 mb-1">HOME</span>
              <span className="text-5xl font-black text-blue-600 tracking-tighter">{homeScore}</span>
            </div>
            <div className="text-3xl font-light text-gray-300">vs</div>
            <div className="text-center">
              <span className="block text-xs text-gray-400 mb-1">AWAY</span>
              <span className="text-5xl font-black text-red-600 tracking-tighter">{awayScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 得点クイックボタン */}
      <div className="grid grid-cols-2 gap-4">
        <button className={`${btnBase} bg-blue-600 text-white h-20 text-2xl`} onClick={() => addGoal("home")}>H + 1</button>
        <button className={`${btnBase} bg-red-600 text-white h-20 text-2xl`} onClick={() => addGoal("away")}>A + 1</button>
      </div>

      {/* フェーズ切り替え */}
      <div className="grid grid-cols-3 gap-2">
        <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-50" onClick={() => changePhase("前半")}>前半</button>
        <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-50" onClick={() => changePhase("後半")}>後半</button>
        <button className="bg-gray-900 text-white rounded-lg p-3 text-sm font-bold shadow-lg" onClick={() => changePhase("終了")}>終了</button>
      </div>

      {/* 選手別得点 */}
      <div className={cardClass}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700">選手別スコア</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">HOME Players</span>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {homePlayers.map((p, i) => (
                <button key={i} className="bg-blue-50 border border-blue-100 text-blue-700 rounded-md py-2 text-sm active:bg-blue-200" onClick={() => addGoal("home", i)}>
                  <span className="block text-[10px] opacity-60">{i + 1}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">AWAY Players</span>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {awayPlayers.map((p, i) => (
                <button key={i} className="bg-red-50 border border-red-100 text-red-700 rounded-md py-2 text-sm active:bg-red-200" onClick={() => addGoal("away", i)}>
                  <span className="block text-[10px] opacity-60">{i + 1}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={resetGame} className="w-full text-xs text-gray-400 py-2 hover:text-red-500 transition-colors">
        データをすべてリセットする
      </button>

      {/* 履歴 */}
      <div className={cardClass}>
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-700">試合ログ</h2>
          <span className="text-[10px] text-gray-400">履歴保存なし</span>
        </div>
        <div ref={historyRef} className="max-h-52 overflow-y-auto text-[11px] p-2 space-y-1">
          {history.length === 0 && <div className="text-center text-gray-300 py-10 italic">記録はまだありません</div>}
          {history.map((h, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded p-2 flex justify-between items-center shadow-sm">
              {h.type === "phase" ? (
                <span className="font-bold text-gray-800">🚩 {h.time} 【{h.label}開始】 {h.score}</span>
              ) : (
                <>
                  <span className="text-gray-500">{h.time}</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${h.team === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {h.team === "home" ? "HOME" : "AWAY"} {h.idx !== null ? `${h.idx + 1}番` : ""}
                  </span>
                  <span className="text-gray-400 font-mono">{h.score}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
