import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import {db} from "../firebase";
import {collection, addDoc, serverTimestamp} from "firebase/firestore";

const lineSets = {
  set1: ["동해물과 백두산이 마르고 닳도록",
  "하느님이 보우하사 우리나라 만세",
  "무궁화 삼천리 화려강산",
  "대한사람 대한으로 길이 보전하세",
  "남산 위에 저 소나무 철갑을 두른 듯",
  "바람 서리 불변함은 우리 기상일세",
  "무궁화 삼천리 화려강산",
  "대한사람 대한으로 길이 보전하세",
  "가을 하늘 공활한데 높고 구름 없이",
  "밝은 달은 우리 가슴 일편단심일세",
  "무궁화 삼천리 화려강산",
  "대한사람 대한으로 길이 보전하세",
  "이 기상과 이 맘으로 충성을 다하여",
  "괴로우나 즐거우나 나라 사랑하세",
  "무궁화 삼천리 화려강산",
  "대한사람 대한으로 길이 보전하세"],
  set2: ["<4차 산업혁명 시대를 주도할 여성 AI 인재 양성>",
    "이라는 시대적 소명 아래, 본교는 AI 분야 교육 및", "연구를 선도하기 위하여 인공지능대학을 설립하였습니다.", "인공지능대학은 통찰력과 전문성을 갖춘 AI 인재 양성을", "목표로 현재 2개 학과(컴퓨터공학과, 사이버보안학과),", "1개 학부 및 2개 전공(인공지능데이터사이언스학부", "인공지능전공, 데이터사이언스전공)으로 운영하고 있습니다.","인공지능대학은 이화만의 특화된 AI 분야에 대한", "집중 투자를 통하여, 해당 분야의 독보적인 교육 및", "연구 환경을 조성함으로써 세계적인 전문 인력을", "양성하고 AI와 함께하는 미래를 준비하는", "최전방 대학으로 자리매김할 것입니다."],
  set3: ["어려분 단체방에 죄송하지만 글 하나만 젇겠습니다.", "안녕래은아너를처음본순간부터좋아했어",
    "방학전에고백하고싶었는데바보같이그땐용기가없더라", "지금은이수많은사람들앞에서오로지너만사랑한다고말하고싶어서", "큰마음먹고용기내어봐매일매일버스에서너볼때마다", "두근댔고동아리랑과활동에서도너만보이고너생각만나고", "지난3월부터계속그랬어니가남자친구랑헤어지고", "니맘이아파울때내마음도너무아팠지만내심좋은맘두있었어", "이런내맘을어떻게말할지고민하다가정말인생에서제일크게",
    "용기내어세상에서제일멋지게많은사람들앞에서", "너한테고백해주고싶었어사랑하는래은님", "내여자가되줄래?아니나만의태양이되어줄래?", "난너의달님이될게", "내일3시반에너수업마치고학관앞에서기다리고있을게", "너를사랑하는윤서가", "이제누가공지해주냐"
  ]
};

// 한글 분해 로직
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function splitString(str) {
  if (!str) return [];
  return str.split("").flatMap(c => {
    const code = c.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return [c];
    const n = code - 0xac00;
    const res = [CHO[Math.floor(n / 588)], JUNG[Math.floor((n % 588) / 28)]];
    const jong = n % 28;
    if (JONG[jong]) res.push(JONG[jong]);
    return res;
  });
}

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, group, setId } = location.state || {name: "none", group: "none", setId: "set1"};
  const lines = lineSets[setId] || lineSets.set1;

  const [currentLine, setCurrentLine] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [finalElapsed, setFinalElapsed] = useState(0);

  const [accJamoCount, setAccJamoCount] = useState(0);
  const [accErrors, setAccErrors] = useState(0);

  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const inputRef = useRef(null);

  // firebase score 저장 함수
  const saveScore = async (speed, accuracy) => {
    try {
      await addDoc(collection(db, "rankings"), {
        name: name || "none",
        group: group || "none",
        speed: Math.round(speed),
        accuracy: Number(accuracy.toFixed(1)),
        setId: setId || "set1",
        timestamp: serverTimestamp()
      });
      console.log("스코어 저장 완료");
    } catch (error) {
      console.error("스코어 저장 오류:", error);
    }
  };

  // -----------------------------
  // 메트릭 계산 함수
  // -----------------------------
  const updateMetrics = (currentInput) => {
    if (!startTime) return;

    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const minutes = Math.max(elapsed / 60, 0.001);

    const currentInputJamo = splitString(currentInput);
    const currentTargetJamo = splitString(lines[currentLine] || "");
    
    let currentLineErrors = 0;
    currentInputJamo.forEach((jamo, i) => {
      if (jamo !== currentTargetJamo[i]) currentLineErrors++;
    });

    const totalJamo = accJamoCount + currentInputJamo.length;
    const totalErrors = accErrors + currentLineErrors;

    const spd = totalJamo / minutes;
    const acc = totalJamo === 0 ? 100 : ((totalJamo - totalErrors) / totalJamo) * 100;

    setSpeed(spd);
    setAccuracy(acc);
  };

  // -----------------------------
  // 이벤트 핸들러
  // -----------------------------
  const handleInputChange = (e) => {
    if (isFinished) return;
    const val = e.target.value;
    
    // 첫 입력 시 시작 시간 설정
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }
    
    setInput(val);
    updateMetrics(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const currentInputJamo = splitString(input);
      const currentTargetJamo = splitString(lines[currentLine]);
      
      let lineErrors = 0;
      currentInputJamo.forEach((jamo, i) => {
        if (jamo !== currentTargetJamo[i]) lineErrors++;
      });

      const nextJamoCount = accJamoCount + currentInputJamo.length;
      const nextErrors = accErrors + lineErrors;

      if (currentLine === lines.length - 1) {
        const endTime = Date.now();
        const totalTimeSeconds = (endTime - startTime) / 1000;
        setFinalElapsed(totalTimeSeconds);
        
        // 최종 결과 고정
        const finalMinutes = Math.max(totalTimeSeconds / 60, 0.001);
        setSpeed(nextJamoCount / finalMinutes);
        setAccuracy(((nextJamoCount - nextErrors) / nextJamoCount) * 100);
        
        setIsFinished(true);
        saveScore(speed, accuracy);
      } else {
        setAccJamoCount(nextJamoCount);
        setAccErrors(nextErrors);
        setCurrentLine(prev => prev + 1);
        setInput("");
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  };

  const renderTargetLine = () => {
    const targetText = lines[currentLine] || "";
    return targetText.split("").map((char, i) => {
      let color = (input[i] !== undefined && input[i] === char) ? "#c36fff" : "black";
      return <span key={i} style={{ color }}>{char}</span>;
    });
  };

  const renderFakeInput = () => {
    const targetText = lines[currentLine] || "";
    return input.split("").map((char, i) => {
      const isWrong = targetText[i] !== undefined && char !== targetText[i];
      return <span key={i} style={{ color: isWrong ? "red" : "black" }}>{char}</span>;
    });
  };

  return (
    <div style={styles.container} onClick={() => inputRef.current?.focus()}>
      <div style={styles.userInfo}>{name} / {group}</div>

      <div style={styles.gameBox}>
        <div style={styles.subBox}>{lines[currentLine - 1] || ""}</div>
        <div style={styles.mainBox}>{renderTargetLine()}</div>
        <div style={styles.subBox}>{lines[currentLine + 1] || ""}</div>
        <div style={styles.subBox}>{lines[currentLine + 2] || ""}</div>

        <div style={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={styles.hiddenInput}
            autoFocus
          />
          <div style={styles.fakeInput}>
            {renderFakeInput()}
            {!isFinished && <span className="cursor" style={styles.cursor}>|</span>}
          </div>
        </div>

        <div style={styles.metrics}>
          <span>평균 타수: {Math.round(speed)}</span>
          <span style={{ marginLeft: "30px" }}>정확도: {accuracy.toFixed(1)}%</span>
        </div>
      </div>

      {isFinished && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{textAlign: 'center'}}>게임 종료</h2>
            <div style={styles.resultRow}><span>닉네임</span> <b>{name}</b></div>
            <div style={styles.resultRow}><span>소속 학과</span> <b>{group}</b></div>
            <div style={styles.resultRow}><span>최종 타수</span> <b style={{color: '#007bff'}}>{Math.round(speed)}</b></div>
            <div style={styles.resultRow}><span>최종 정확도</span> <b style={{color: '#28a745'}}>{accuracy.toFixed(1)}%</b></div>
            <div style={styles.resultRow}><span>소요 시간</span> <b style={{color: '#28a745'}}>{formatTime(finalElapsed)}</b></div>
            <div style={styles.btnGroup}>
              <button onClick={() => window.location.reload()} style={styles.btn}>다시 하기</button>
              <button onClick={() => navigate("/")} style={{...styles.btn, backgroundColor: "#6c757d"}}>홈</button>
              <button onClick={() => navigate("/scoreboard")} style={{...styles.btn, backgroundColor: "#28a745"}}>스코어보드</button>
</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0% {opacity:0} 50% {opacity:1} 100% {opacity:0} }
        .cursor { animation: blink 1s infinite; }
      `}</style>

      <Footer />
    </div>
  );
}

const styles = {
  container: { padding: "60px 20px", fontFamily: "Galmuri11", backgroundColor: "#f0f2f5", minHeight: "100vh",
    backgroundImage: "url('/images/bg2.png')",
    backgroundSize: 'cover', backgroundPosition: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
   },
  userInfo: { position: "absolute", top: 20, right: 20, fontSize: "14px", color: "#888", backgroundColor: "white", padding: '0px 10px' },
  gameBox: { marginTop: "130px", maxWidth: "800px", margin: "0 auto", textAlign: "center", backgroundColor: "white", padding: "50px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  subBox: { height: "30px", fontSize: "18px", color: "#ddd", margin: "10px 0" },
  mainBox: { fontSize: "32px", fontWeight: "bold", margin: "25px 0", minHeight: "45px", letterSpacing: "1px" },
  inputContainer: { position: "relative", width: "90%", margin: "0 auto", height: "55px", border: "2px solid #eee", borderRadius: "10px", display: "flex", alignItems: "center", overflow: "hidden",
    backgroundImage: "url('/images/input.png')", backgroundSize: "cover",
    backgroundPosition: "center",
   },
  hiddenInput: { position: "absolute", width: "100%", height: "100%", opacity: 0, zIndex: 2, cursor: "text", border: "none", outline: "none" },
  fakeInput: { padding: "0 15px", fontSize: "22px", textAlign: "left", width: "100%", whiteSpace: "pre", pointerEvents: "none" },
  cursor: { color: "#007bff", fontWeight: "bold", marginLeft: "2px" },
  metrics: { marginTop: "40px", fontSize: "20px", fontWeight: "600", color: "#555" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "320px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", fontFamily: 'Galmuri9' },
  resultRow: { display: "flex", justifyContent: "space-between", margin: "15px 0", fontSize: "18px", borderBottom: "1px solid #f5f5f5", paddingBottom: "5px" },
  btnGroup: {display: "flex", gap: "10px", marginTop: "20px"},
  btn: {flex: 1, padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "bold"}
};

export default Game;