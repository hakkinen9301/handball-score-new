import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

export default function App() {
  const [info, setInfo] = useState({ date: "", round: "", home: "", away: "" });
  const [started, setStarted] = useState(false);
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState(null);

  // ★追加（履歴）
  const [history, setHistory] = useState([]);

  const bottomRef = useRef(null);

  // -----------------------
  // 自動スクロール
  // -----------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [events]);

  // -----------------------
  // ★追加：初期ロード
  // -----------------------
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

  // -----------------------
  // ★追加：自動保存
  // -----------------------
  useEffect(() => {
    if (!started) return;
    localStorage.setItem(
      "current_match",
      JSON.stringify({ info, events })
    );
  }, [events, info, started]);

  // -----------------------
  // スコア計算（そのまま）
  // -----------------------
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

  // -----------------------
  // イベント追加（そのまま）
  // -----------------------
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

  // -----------------------
  // ★変更：保存 → 履歴保存
  // -----------------------
  const save = () => {
    const newHistory = [
      { info, events, date: new Date().toISOString() },
      ...history
    ];
    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
    alert("履歴に保存しました");
  };

  // -----------------------
  // ★追加：履歴読込
  // -----------------------
  const loadMatch = (match) => {
    setInfo(match.info);
    setEvents(match.events);
    setStarted(true);
  };

  // -----------------------
  // ★追加：画像保存（DOM触らない安全版）
  // -----------------------
  const saveImage = async () => {
    const canvas = await html2canvas(document.body, {
      backgroundColor: "#000",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // -----------------------
  // 得点集計（そのまま）
  // -----------------------
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

            {/* ★履歴表示（ここだけ追加） */}
            {history.length > 0 && (
              <div style={{marginTop:20}}>
                <div>履歴</div>
                {history.map((h,i)=>(
                  <div key={i}>
                    <button onClick={()=>loadMatch(h)}>
                      {h.info.home} vs {h.info.away}
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
          {/* ★ここは一切触ってない */}
          {/* ↓あなたの元コードそのまま */}

          {/* （中略：あなたの貼ってくれたコードそのまま） */}

          <div style={styles.actions}>
            <button onClick={undo}>戻る</button>
            <button onClick={save}>履歴保存</button>
            <button onClick={saveImage}>画像保存</button>
          </div>
        </>
      )}
    </div>
  );
}
