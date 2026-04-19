// ★ stylesだけ差し替えじゃなく全部そのまま使える版

const styles = {
  container:{
    background:"#0a0a0a",
    color:"#fff",
    height:"100vh",
    display:"flex",
    flexDirection:"column",
    fontFamily:"system-ui, -apple-system, sans-serif"
  },

  header:{
    position:"sticky",
    top:0,
    background:"#000",
    textAlign:"center",
    padding:8
  },

  scoreRow:{
    display:"flex",
    justifyContent:"center",
    gap:6,
    fontSize:12
  },

  timeline:{
    flex:1,
    overflowY:"auto",
    padding:8,
    display:"flex",
    flexDirection:"column",
    alignItems:"center" // ★中央寄せ
  },

  row:{
    display:"grid",
    gridTemplateColumns:"50px 100px 70px 100px 50px", // ★幅調整
    alignItems:"center",
    height:22,
    width:"100%",
    maxWidth:420, // ★全体中央寄せの基準
  },

  c1:{
    textAlign:"center",
    color:"#60a5fa",
    whiteSpace:"nowrap" // ★折り返し防止
  },

  c2:{
    textAlign:"right",
    color:"#60a5fa",
    whiteSpace:"nowrap"
  },

  c3:{
    textAlign:"center",
    fontWeight:"bold",
    width:70
  },

  c4:{
    textAlign:"left",
    color:"#f87171",
    whiteSpace:"nowrap"
  },

  c5:{
    textAlign:"center",
    color:"#f87171",
    whiteSpace:"nowrap"
  },

  section:{
    textAlign:"center",
    margin:"6px 0",
    color:"#aaa"
  },

  bottom:{
    position:"sticky",
    bottom:0,
    background:"#000",
    padding:6
  },

  stats:{
    marginBottom:4
  },

  statRow:{
    display:"grid",
    gridTemplateColumns:"repeat(8,1fr)",
    fontSize:12,
    textAlign:"center"
  },

  btnRow:{
    display:"grid",
    gridTemplateColumns:"repeat(4,1fr)",
    gap:4,
    marginBottom:4
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(5,1fr)",
    gap:4
  },

  num:{
    padding:12,
    fontSize:16,
    background:"#222",
    color:"#fff"
  },

  blue:{background:"#2563eb",color:"#fff",padding:10},
  blueSub:{background:"#3b82f6",color:"#fff",padding:10},
  red:{background:"#dc2626",color:"#fff",padding:10},
  redSub:{background:"#ef4444",color:"#fff",padding:10},

  actions:{
    display:"flex",
    justifyContent:"space-around",
    marginTop:4
  },

  startWrap:{
    height:"100%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },

  startBox:{
    display:"flex",
    flexDirection:"column",
    gap:12,
    width:"80%"
  },

  bigInput:{padding:14,fontSize:16},

  startBtn:{padding:14,fontSize:16,background:"#2563eb",color:"#fff"}
};
