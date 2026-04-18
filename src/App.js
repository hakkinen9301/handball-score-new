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
    setHomeScore(0);
    setAwayScore(0);
    setHomePlayers(Array(8).fill(0));
    setAwayPlayers(Array(8).fill(0));
    setPhase("前半");
    setHistory([]);
  };

  const buttonStyle = "border rounded-md px-4 py-2 text-white font-bold transition-opacity hover:opacity-80";

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4" style={{ fontFamily: "sans-serif" }}>
      <div className="border rounded-lg p-4 text-center bg-white shadow-sm">
        <h1 className="text-xl font-bold">ハンドボールスコア</h1>
        <div className="text-sm text-gray-500">{phase}</div>
        <div className="flex justify-around text-3xl font-bold mt-2">
          <div className="text-blue-600">H {homeScore}</div>
          <div className="text-red-600">A {awayScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className={`${buttonStyle} bg-blue-600 h-16 text-lg`} onClick={() => addGoal("home")}>H+1</button>
        <button className={`${buttonStyle} bg-red-600 h-16 text-lg`} onClick={() => addGoal("away")}>A+1</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="border rounded p-2 bg-gray-100" onClick={() => changePhase("前半")}>前半</button>
        <button className="border rounded p-2 bg-gray-100" onClick={() => changePhase("後半")}>後半</button>
        <button className="border rounded p-2 bg-black text-white" onClick={() => changePhase("終了")}>終了</button>
      </div>

      <button onClick={resetGame} className="w-full border rounded p-2 text-gray-600 hover:bg-gray-50">
        リセット
      </button>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="font-bold text-sm mb-2 text-blue-700">HOME 選手別得点</h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {homePlayers.map((p, i) => (
            <button key={i} className="bg-blue-500 text-white rounded p-2 text-xs" onClick={() => addGoal("home", i)}>
              {i + 1}番:{p}点
            </button>
          ))}
        </div>

        <h2 className="font-bold text-sm mb-2 text-red-700 border-t pt-2">AWAY 選手別得点</h2>
        <div className="grid grid-cols-4 gap-2">
          {awayPlayers.map((p, i) => (
            <button key={i} className="bg-red-500 text-white rounded p-2 text-xs" onClick={() => addGoal("away", i)}>
              {i + 1}番:{p}点
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="font-bold text-sm mb-2">得点履歴</h2>
        <div ref={historyRef} className="max-h-48 overflow-y-auto text-sm space-y-1">
          {history.map((h, i) => (
            <div key={i} className="border-b pb-1 flex justify-between">
              {h.type === "phase" ? (
                <span className="font-bold text-purple-600">{h.time} 【{h.label}開始】 {h.score}</span>
              ) : (
                <span>
                  {h.time} {h.team === "home" ? "HOME" : "AWAY"}
                  {h.idx !== null ? ` ${h.idx + 1}番` : ""} +1点 ({h.score})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
