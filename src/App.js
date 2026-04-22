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

  const save = () => {
    const key = `${info.date}_${info.round}_${info.home}_${info.away}`;

    const newHistory = [
      { key, info, events },
      ...history.filter(h => h.key !== key)
    ];

    setHistory(newHistory);
    localStorage.setItem("match_history", JSON.stringify(newHistory));
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

  // ★ここだけ差し替え（画像保存）
  const saveImage = async () => {
    if (!window.html2canvas) {
      alert("html2canvas未読込");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.style.background = "#000";
    wrapper.style.color = "#fff";
    wrapper.style.padding = "60px 20px";
    wrapper.style.width = "375px";

    const header = document.createElement("div");
    header.style.textAlign = "center";
    header.style.marginBottom = "10px";
    header.innerHTML = `
      ${info.date} / ${info.round}<br/>
      ${info.home} vs ${info.away}<br/>
      TOTAL ${calcScore("total")}
    `;
    wrapper.appendChild(header);

    const statsDiv = document.createElement("div");
    statsDiv.style.display = "grid";
    statsDiv.style.gridTemplateColumns = "repeat(8,1fr)";
    statsDiv.style.fontSize = "12px";
    statsDiv.style.marginBottom = "10px";

    [...blueList, ...redList].forEach((p, i) => {
      const d = document.createElement("div");
      d.style.textAlign = "center";
      d.style.color = i < blueList.length ? "#60a5fa" : "#f87171";
      d.innerText = `#${p.num} ${p.count}`;
      statsDiv.appendChild(d);
    });

    wrapper.appendChild(statsDiv);

    events.forEach(e => {
      if (e.type === "section") return;

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.fontSize = "12px";

      const mark =
        e.type==="goal"?(e.team==="blue"?"🔵":"🔴"):
        e.type==="miss"?"❌":
        e.type==="out"?"⛔":"↩";

      row.innerHTML = `
        <div style="color:#60a5fa">${e.team==="blue" ? `#${e.number} ${mark}` : ""}</div>
        <div>${e.score}</div>
        <div style="color:#f87171">${e.team==="red" ? `${mark} #${e.number}` : ""}</div>
      `;

      wrapper.appendChild(row);
    });

    document.body.appendChild(wrapper);

    const canvas = await window.html2canvas(wrapper, { scale: 2 });

    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();

    document.body.removeChild(wrapper);
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
      {/* ★ここ以降は一切変更なし */}
