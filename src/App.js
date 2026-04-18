import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    setHistory([
      {
        type: "phase",
        label: nextPhase,
        time: new Date().toLocaleTimeString().slice(0, 8),
        score: `${homeScore}-${awayScore}`,
      },
      ...history,
    ]);
  };

  const resetGame = () => {
    setHomeScore(0);
    setAwayScore(0);
    setHomePlayers(Array(8).fill(0));
    setAwayPlayers(Array(8).fill(0));
    setPhase("前半");
    setHistory([]);
  };

  const renderPlayerGrid = (players, team) => {
    return (
      <div className="grid grid-cols-4 gap-2">
        {players.map((p, i) => (
          <Button
            key={i}
            className={team === "home" ? "bg-blue-600 text-white h-12 text-sm" : "bg-red-600 text-white h-12 text-sm"}
            onClick={() => addGoal(team, i)}
          >
            {i + 1}:{p}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div
      className="p-4 max-w-xl mx-auto space-y-3 min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60')",
      }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 space-y-3">
        <Card>
          <CardContent className="text-center space-y-1">
            <h1 className="text-xl font-bold">ハンドボールスコア</h1>
            <div className="text-sm">{phase}</div>
            <div className="flex justify-around text-2xl font-bold">
              <div>H {homeScore}</div>
              <div>A {awayScore}</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-blue-600 text-white h-12" onClick={() => addGoal("home")}>H+1</Button>
          <Button className="bg-red-600 text-white h-12" onClick={() => addGoal("away")}>A+1</Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => changePhase("前半")}>前半</Button>
          <Button onClick={() => changePhase("後半")}>後半</Button>
          <Button className="bg-gray-800 text-white" onClick={() => changePhase("終了")}>終了</Button>
        </div>

        <Button variant="outline" onClick={resetGame} className="w-full h-10">
          リセット
        </Button>

        <Card>
          <CardContent>
            <h2 className="font-bold text-sm mb-2">HOME</h2>
            {renderPlayerGrid(homePlayers, "home")}

            <h2 className="font-bold text-sm mt-3 mb-2">AWAY</h2>
            {renderPlayerGrid(awayPlayers, "away")}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-bold text-sm mb-1">履歴</h2>
            <div ref={historyRef} className="max-h-60 overflow-y-auto text-xs space-y-0">
              {history.map((h, i) => (
                <div key={i} className="border-b py-0.5 flex justify-between gap-2 whitespace-nowrap">
                  {h.type === "phase" ? (
                    <span className="font-bold">{h.time} {h.label} {h.score}</span>
                  ) : (
                    <span>
                      {h.time} {h.team === "home" ? "H" : "A"}{h.idx !== null ? h.idx + 1 : ""} +1 {h.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
