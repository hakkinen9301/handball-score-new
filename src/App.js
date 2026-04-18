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
      time: new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
      time: new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score: `${homeScore}-${awayScore}`,
    }, ...history]);
  };

  const resetGame = () => {
    if (!confirm("すべてのスコアをリセットしますか？")) return;
    setHomeScore(0);
    setAwayScore(0);
    setHomePlayers(Array(8).fill(0));
    setAwayPlayers(Array(8).fill(0));
    setPhase("前半");
    setHistory([]);
  };

  // UI Components (Shadow-copy of shadcn)
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white text-slate-950 border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
  );

  const Button = ({ children, onClick, className = "", variant = "default" }) => {
    const variants = {
      default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
      ghost: "hover:bg-slate-100 text-slate-900",
      blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
      red: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200",
    };
    return (
      <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 active:scale-[0.98] ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header Score Card */}
        <Card className="overflow-hidden border-t-4 border-t-slate-900">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Match Score</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{phase}</span>
            </div>
            <div className="flex justify-between items-center px-4">
              <div className="text-center">
                <div className="text-4xl font-black tabular-nums tracking-tighter text-blue-600">{homeScore}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Home</div>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="text-center">
                <div className="text-4xl font-black tabular-nums tracking-tighter text-red-600">{awayScore}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Away</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => addGoal("home")} variant="blue" className="h-16 text-lg font-bold">H + 1</Button>
          <Button onClick={() => addGoal("away")} variant="red" className="h-16 text-lg font-bold">A + 1</Button>
        </div>

        {/* Phase Controls */}
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg">
          <button onClick={() => changePhase("前半")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${phase === "前半" ? "bg-white shadow-sm text-slate-950" : "text-slate-500 hover:text-slate-700"}`}>前半</button>
          <button onClick={() => changePhase("後半")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${phase === "後半" ? "bg-white shadow-sm text-slate-950" : "text-slate-500 hover:text-slate-700"}`}>後半</button>
          <button onClick={() => changePhase("終了")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${phase === "終了" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>終了</button>
        </div>

        {/* Player Grids */}
        <Card>
          <div className="p-4 space-y-6">
            <section>
              <h2 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> HOME PLAYERS
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {homePlayers.map((p, i) => (
                  <button key={i} onClick={() => addGoal("home", i)} className="group flex flex-col items-center justify-center p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all">
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-mono">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{p}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="pt-2 border-t border-slate-50">
              <h2 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> AWAY PLAYERS
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {awayPlayers.map((p, i) => (
                  <button key={i} onClick={() => addGoal("away", i)} className="group flex flex-col items-center justify-center p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-red-50 hover:border-red-200 transition-all">
                    <span className="text-[10px] text-slate-400 group-hover:text-red-400 font-mono">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-red-700">{p}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </Card>

        {/* History Log */}
        <Card className="bg-slate-900 text-slate-50 border-none shadow-xl">
          <div className="p-4 flex justify-between items-center border-b border-slate-800">
            <h2 className="text-xs font-bold tracking-widest uppercase opacity-50">Timeline</h2>
            <Button variant="ghost" onClick={resetGame} className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2">RESET ALL</Button>
          </div>
          <div ref={historyRef} className="max-h-60 overflow-y-auto p-2 space-y-2 scrollbar-hide">
            {history.length === 0 && (
              <div className="py-12 text-center text-slate-600 text-xs italic">No records yet.</div>
            )}
            {history.map((h, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded-md ${h.type === 'phase' ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-800/20'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono opacity-40">{h.time}</span>
                  {h.type === 'phase' ? (
                    <span className="text-xs font-bold text-amber-400">[{h.label}開始]</span>
                  ) : (
                    <span className={`text-xs font-bold ${h.team === 'home' ? 'text-blue-400' : 'text-red-400'}`}>
                      {h.team === 'home' ? 'HOME' : 'AWAY'} {h.idx !== null ? `#${h.idx + 1}` : ''}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black tabular-nums">{h.score}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
