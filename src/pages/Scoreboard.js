import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore";

function Scoreboard() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [currentTab, setCurrentTab] = useState("set1");

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate();

      const KST_OFFSET = 9 * 60 * 60 * 1000;
      const kstDate = new Date(date.getTime() + KST_OFFSET);

      const y = kstDate.getUTCFullYear();
      const m = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(kstDate.getUTCDate()).padStart(2, '0');
      const h = String(kstDate.getUTCHours()).padStart(2, '0');
      const min = String(kstDate.getUTCMinutes()).padStart(2, '0');
      return `${y}.${m}.${d} ${h}:${min}`;
    } catch (e) {
      return "-";
    }
  };

  useEffect(() => {
    setRankings([]);

    const q = query(
      collection(db, "rankings"),
      where("setId", "==", currentTab)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        
        // 🎯 [조정 점수 계산] 정확도가 낮을수록 점수가 크게 깎임
        // 정확도 60% 미만은 점수를 0으로 처리해서 맨 아래로 보냄
        const calculatedScore = item.accuracy < 60 
          ? 0 
          : (item.speed || 0) * Math.pow((item.accuracy || 0) / 100, 2);

        return {
          id: doc.id,
          ...item,
          adjustedScore: calculatedScore
        };
      });

      // 3. 조정 점수(adjustedScore) 기준으로 내림차순 정렬
      const sortedData = data.sort((a, b) => b.adjustedScore - a.adjustedScore);
      
      setRankings(sortedData);
    });

    return () => unsubscribe();
  }, [currentTab]);

  return (
    <div style={styles.container}>
      <div style={styles.titleImgContainer}>
        <img src="/images/title.png" alt="타이틀" style={styles.titleImg} />
      </div>

      <h1 style={styles.title}>
        <img src='/images/rankings.png' alt="랭킹-타이틀" style={styles.titleImg} />
      </h1>

      <div style={styles.topBtnGroup}>
        <button 
          onClick={() => setCurrentTab("set1")} 
          style={currentTab === "set1" ? styles.activeTab : styles.tab}
        >애국가</button>
        <button 
          onClick={() => setCurrentTab("set2")} 
          style={currentTab === "set2" ? styles.activeTab : styles.tab}
        >인공지능대학</button>
        <button 
          onClick={() => setCurrentTab("set3")} 
          style={currentTab === "set3" ? styles.activeTab : styles.tab}
        >이누공</button>
        <button 
          onClick={() => navigate("/")} 
          style={styles.homeTabBtn}
        >홈으로</button>
      </div>

      {/* <h1 style={styles.title}> {
        currentTab === "set1" ? "애국가" : 
        currentTab === "set2" ? "인공지능대학" : "set3"
      } 전체 랭킹</h1> */}

      <table style={styles.table}>
        <thead>
          <tr style={styles.theadRow}>
            <th>순위</th>
            <th>닉네임</th>
            <th>소속 학과</th>
            <th>타수</th>
            <th>정확도</th>
            <th>기록 일시</th>
          </tr>
        </thead>

        <tbody>
          {rankings.map((r, i) => {
            const isValidScore = (r.accuracy >= 60) && (r.speed > 0);
    
            return (
              <tr
                key={r.id}
                style={{
                  ...styles.tr,
                  ...(i === 0 && isValidScore ? styles.first : {})
                }}>
                <td>{isValidScore ? i + 1 : "-"}</td>
                <td>{r.name || "익명"}</td>
                <td>{r.group || "무소속"}</td>
                <td>{Math.round(r.speed || 0)}</td>
                <td>{r.accuracy ? r.accuracy.toFixed(1) : "0.0"}%</td>
                <td style={styles.timeCell}>{formatDateTime(r.timestamp || r.createdAt)}</td>
             </tr>
    );
  })}
        </tbody>
      </table>

      {rankings.length === 0 && (
        <p style={{ marginTop: "20px", color: "#888" }}>아직 기록이 없습니다.</p>
      )}
      <Footer />
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    textAlign: "center",
    fontFamily: "Pretendard, sans-serif",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    backgroundImage: "url('/images/bg2.png')",
    backgroundSize: 'cover', backgroundPosition: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
  },
  titleImgContainer: {
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",    
    width: "100%",
    marginTop: "50px"
  },
  titleImg: {
    width: "450px",
    height: "auto",
    display: "block",
    margin: "0 auto",
  },
  topBtnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    maxWidth: "800px",
    margin: "0 auto 30px auto"
  },
  tab: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "white",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s"
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "#c36fff",
    color: "white",
    border: "1px solid #c36fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0,123,255,0.2)"
  },
  homeTabBtn: {
    flex: 1,
    padding: "12px",
    fontSize: "15px", fontFamily: "Galmuri11",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  title: {
    fontSize: "28px", fontFamily: "pixelroborobo",
    marginBottom: "50px",
    fontWeight: "800",
    color: "#333"
  },
  table: {
    margin: "0 auto",
    borderCollapse: "collapse",
    width: "100%",
    maxWidth: "900px",
    backgroundColor: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    borderRadius: "15px",
    overflow: "hidden"
  },
  theadRow: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #eee",
    height: "50px", fontFamily: "Galmuri11",
  },
  tr: {
    borderBottom: "1px solid #f1f1f1",
    height: "50px", fontFamily: "Galmuri9",
  },
  first: {
    backgroundColor: "#fff9c4", // 1등 강조 색상
    fontWeight: "bold", fontFamily: "Galmuri9",
  },
  timeCell: {
    fontSize: "12px",
    color: "#999"
  }
};

export default Scoreboard;