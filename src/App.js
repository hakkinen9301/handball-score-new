import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HandballScoreApp() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [phase, setPhase] = useState("前半");
  const [history, setHistory] = useState([]);

  const addGoal = (team) => {
    const newHistory = {
      time: new Date().toLocaleTimeString(),
      phase,
      team,
      homeScore: team === "home" ? homeScore + 1 : homeScore,
      awayScore: team === "away" ? awayScore + 1 : awayScore,
    };

    if (team === "home") setHomeScore(homeScore + 1);
    else setAwayScore(awayScore + 1);

    setHistory([newHistory, ...history]);
  };

  const changePhase = (nextPhase) => {
    setPhase(nextPhase);
    setHistory([
      {
        type: "phase",
        label: `--- ${nextPhase} ---`,
        time: new Date().toLocaleTimeString(),
      },
      ...history,
    ]);
  };

  const resetGame = () => {
    setHomeScore(0);
    setAwayScore(0);
    setPhase("前半");
    setHistory([]);
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Card>
        <CardContent className="text-center space-y-2">
          <h1 className="text-2xl font-bold">ハンドボールスコア</h1>
          <div className="text-lg">現在：{phase}</div>
          <div className="flex justify-around text-3xl font-bold">
            <div>HOME {homeScore}</div>
            <div>AWAY {awayScore}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-blue-600 text-white h-16 text-lg" onClick={() => addGoal("home")}>HOME +1</Button>
        <Button className="bg-red-600 text-white h-16 text-lg" onClick={() => addGoal("away")}>AWAY +1</Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => changePhase("前半")}>前半</Button>
        <Button onClick={() => changePhase("後半")}>後半</Button>
        <Button className="bg-gray-800 text-white" onClick={() => changePhase("試合終了")}>終了</Button>
      </div>

      <Button variant="outline" onClick={resetGame} className="w-full">
        リセット
      </Button>

      <Card>
        <CardContent className="space-y-1">
          <h2 className="font-bold">スコア履歴</h2>
          {history.map((h, i) => (
            <div key={i} className="text-sm border-b py-1">
              {h.type === "phase" ? (
                <span className="font-bold">{h.label}</span>
              ) : (
                <span>
                  [{h.time}] {h.phase} {h.team === "home" ? "HOME" : "AWAY"} +1 → {h.homeScore}-{h.awayScore}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
