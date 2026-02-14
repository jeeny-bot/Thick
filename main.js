import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Firebase 설정값 (당신이 콘솔에서 복사한 값 그대로 유지)
const firebaseConfig = {
    apiKey: "AIzaSyB6Ws2dXPrMqUQTwVbGDdcAhdKJzJK1Cmk",
    authDomain: "thick-fdd38.firebaseapp.com",
    projectId: "thick-fdd38",
    storageBucket: "thick-fdd38.firebasestorage.app",
    messagingSenderId: "109235677950",
    appId: "1:109235677950:web:f58eb3bcdfdaea9e3793af",
    measurementId: "G-LH61G4J09W"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 🔥 평균 소비 간격 계산 함수
async function calculatePurchaseCycle(uid, productId) {

  const purchasesRef = collection(db, "userProducts", uid, "products", productId, "purchases");
  const snapshot = await getDocs(purchasesRef);

  let dates = [];

  snapshot.forEach(d => {
    dates.push(d.data().purchaseDate.toDate());
  });

  if (dates.length < 2) {
    alert("구매 데이터가 부족합니다.");
    return;
  }

  dates.sort((a, b) => a - b);

  const first = dates[0];
  const last = dates[dates.length - 1];

  const diffDays = (last - first) / (1000 * 60 * 60 * 24);
  const avgCycle = Math.round(diffDays / (dates.length - 1));

  const predictedNextDate = new Date(last);
  predictedNextDate.setDate(predictedNextDate.getDate() + avgCycle);

  const productRef = doc(db, "userProducts", uid, "products", productId);

  await updateDoc(productRef, {
    avgCycle: avgCycle,
    lastPurchaseDate: last,
    predictedNextDate: predictedNextDate
  });

  alert("평균 계산 완료");
}

// 🔥 HTML 버튼에서 호출 가능하게 등록
window.calculatePurchaseCycle = calculatePurchaseCycle;
