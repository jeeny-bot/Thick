import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 사용자 UID 직접 입력 (테스트용)
const uid = "IGptb5vI9lPq3caXP53ELTfAULF2";

async function loadReport() {

  const productsRef = collection(db, "userProducts", uid, "products");
  const snapshot = await getDocs(productsRef);

  let monthlyTotal = 0;
  let yearlyTotal = 0;

  const productCards = document.getElementById("productCards");

  snapshot.forEach(doc => {

    const data = doc.data();

    const avgCycle = data.avgCycle || 0;
    const productName = doc.id;

    // 월 소비 계산 (단순 추정)
    const monthlyEstimate = avgCycle > 0 ? Math.round((30 / avgCycle) * 5000) : 0;
    const yearlyEstimate = monthlyEstimate * 12;

    monthlyTotal += monthlyEstimate;
    yearlyTotal += yearlyEstimate;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${productName}</h3>
      <p>평균 소비 주기: ${avgCycle}일</p>
      <p>예상 월 소비: ${monthlyEstimate.toLocaleString()}원</p>
      <p>예상 연 소비: ${yearlyEstimate.toLocaleString()}원</p>
    `;

    productCards.appendChild(card);

  });

  document.getElementById("month-total").innerText = monthlyTotal.toLocaleString();
  document.getElementById("yearlyTotal").innerText = yearlyTotal.toLocaleString();
  document.getElementById("yearlySaving").innerText = Math.round(yearlyTotal * 0.1).toLocaleString();

}

loadReport();
