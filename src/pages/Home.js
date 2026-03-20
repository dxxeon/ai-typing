import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Home() {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const navigate = useNavigate();
  const [setId, setSetId] = useState("set1");

  const handleStart = () => {
    if (!name && !group) {
      alert("정보를 입력해주세요"); return;
    } else if (!group && name) {
      alert("소속 학과를 입력해주세요"); return;
    } else if (group && !name) {
      alert("닉네임을 입력해주세요"); return;
    }
    navigate("/game", {
      state: { name, group, setId }
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <img src='/images/title.png' alt="title" />
      </h1>
      <div style={styles.card}>
        
        {/* <p style={styles.subtitle}>닉네임과 소속을 입력하고 시작하세요!</p> */}

        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="닉네임"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <select 
            value={group} 
            onChange={(e) => setGroup(e.target.value)}
            style={styles.select}
          >
            <option value="" style={{color: "#888"}}>소속 학과 선택</option>
            <option value="데이터사이언스전공">데이터사이언스전공</option>
            <option value="사이버보안학과">사이버보안학과</option>
            <option value="인공지능전공">인공지능전공</option>
            <option value="인공지능데이터사이언스학부">인공지능데이터사이언스학부</option>
            <option value="컴퓨터공학과">컴퓨터공학과</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <select 
            value={setId} 
            onChange={(e) => setSetId(e.target.value)}
            style={{...styles.select, border: "2px solid #c36fff"}}
          >
            <option value="" style={{color: "#888"}}>세트 선택</option>
            <option value="set1">애국가 (1~4절)</option>
            <option value="set2">인공지능대학 소개글</option>
            <option value="set3">이누공</option>
          </select>
        </div>

        <div style={styles.btnGroup}>
          <button onClick={handleStart} style={styles.primaryBtn}>
            <img src="/images/btn-start.png" alt="시작" style={styles.btnTextImg} />
          </button>
          <button 
            onClick={() => navigate("/scoreboard")} style={styles.secondaryBtn}>
            <img src="/images/btn-rank.png" alt="랭킹" style={styles.btnTextImg} />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100vh', backgroundImage: "url('/images/bg2.png')",
    backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex',
    justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
    fontFamily: "Galmuri9",
  },
  card: {
    maxWidth: "280px",
    width: "100%",
    backgroundColor: "white",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  title: {
    fontSize: "65px",
    justifyContent: 'rlex-start', marginTop: '80px',
    fontWeight: "bold",
    marginBottom: "50px",
    color: "white",
    lineHeight: "1.4",
    fontFamily: "pixelroborobo",
    WebkitTextStroke: '0.5px black',
    // textShadow: '-2px 2px 0 black, 2px -2px 0 black, -2px 2px 0 black, 2px 2px 0 black'
  },
  subtitle: {
    fontSize: "15px",
    color: "#888",
    marginBottom: "30px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    fontSize: "16px",
    fontFamily: "Galmuri9",
    borderRadius: "10px",
    border: "2px solid #eee",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    fontSize: "16px",
    fontFamily: "Galmuri9",
    borderRadius: "10px",
    border: "2px solid #eee",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
    cursor: "pointer",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    marginTop: "20px",
  },
  btnTextImg: {
    height: "25px",
    PointerEvent: "none",
  },
  primaryBtn: {
    padding: "0",
    backgroundImage: "url('/images/button.png')",
    backgroundSize: "cover", backgroundPosition: "center",
    border: "none", borderRadius: "10px", cursor: "pointer",
    display: "flex", justifyContent: "center", alignItems: "center", height: "45px",
    width: "130px"
  },
  secondaryBtn: {
    padding: "0",
    backgroundImage: "url('/images/button.png')",
    backgroundSize: "cover", backgroundPosition: "center",
    border: "none", borderRadius: "10px", cursor: "pointer",
    display: "flex", justifyContent: "center", alignItems: "center", height: "45px",
    width: "130px"
  },
};

export default Home;