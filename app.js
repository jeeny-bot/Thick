/**
 * Thick Scanner - Orange Edition Engine
 * 사용자 제공 이미지 기반 UI 로직 구현
 */

// 1. 테스트 데이터베이스
const LOCAL_DB = {
    "8801048101037": { name: "신라면 (5개입)", price: 4500 },
    "8801056154018": { name: "칠성사이다 500ml", price: 1800 },
    "8801043014783": { name: "햇반 210g", price: 1500 },
    "8801052028634": { name: "삼다수 2L", price: 1100 }
};

// 2. 상태 관리
let cart = [];
let html5QrCode = null;

// 3. 스캐너 로직
async function startScanner() {
    try {
        html5QrCode = new Html5Qrcode("reader");
        const config = {
            fps: 15,
            qrbox: { width: 250, height: 120 },
            aspectRatio: 1.0
        };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
            }
        );
    } catch (err) {
        console.error(err);
        showToast("⚠️ 스캐너 시작 실패: " + err);
    }
}

function onScanSuccess(barcode) {
    if (navigator.vibrate) navigator.vibrate(100);
    addToCart(barcode);
    showToast("✅ 스캔 성공!");
}

// 4. 장바구니 로직
function addToCart(barcode) {
    // 중복 및 신규 추가 핸들링
    const existing = cart.find(item => item.barcode === barcode);
    if (existing) {
        existing.qty += 1;
    } else {
        const product = LOCAL_DB[barcode] || { name: `미등록 (${barcode})`, price: 4000 };
        cart.push({
            id: Date.now(),
            barcode,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }
    render();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty < 1) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    render();
}

function render() {
    const listEl = document.getElementById('cart-list');
    const countEl = document.getElementById('cart-item-count');
    const totalValEl = document.getElementById('total-val');

    // 이미지의 2열 구조(아이템 박스 + 링크 박스) 구현
    listEl.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div class="cart-item">
                <div class="item-info-main">
                    <div class="item-name-box">
                        <span class="item-name">${item.name}</span>
                    </div>
                    <span class="item-price">${(item.price * item.qty).toLocaleString()}원</span>
                </div>
                <div class="item-qty-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>/</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.name)}" target="_blank" class="item-link-box">가격비교 링크</a>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    totalValEl.innerText = total.toLocaleString();
    countEl.innerText = cart.length;
}

// 5. 기타 기능
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// 초기 실행
window.onload = () => {
    startScanner();
    render();
};
