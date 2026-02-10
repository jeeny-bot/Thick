/**
 * Thick Scanner - Enterprise Engine
 * 이미지 기반 UX 구현 및 카메라 구동 안정화
 */

// 1. 제품 데이터 (이미지 기반 샘플)
const LOCAL_DB = {
    "8801048101037": { name: "신라면 (5개입)", price: 4500 },
    "8801056154018": { name: "칠성사이다 500ml", price: 1800 },
    "8801043014783": { name: "햇반 210g", price: 1500 },
    "8801052028634": { name: "삼다수 2L", price: 1100 },
    "88023014": { name: "미등록 제품", price: 12000 }
};

// 2. 상태 관리
let cart = [];
let html5QrCode = null;

/**
 * 3. 스캐너 엔진 초기화 (강력한 안정성 버전)
 * 카메라 허용 후 작동 안 되는 문제를 해결하기 위해 시퀀스를 단순화함
 */
async function startScanner() {
    try {
        // 기존 인스턴스가 있으면 먼저 정리
        if (html5QrCode) {
            try { await html5QrCode.stop(); } catch (e) { }
        }

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        // facingMode: environment 를 사용하여 후면 카메라 직접 호출
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                // 스캔 중 지속적으로 발생하는 메시지는 무시
            }
        );
        console.log("Scanner Started Successfully");
    } catch (err) {
        console.error("Scanner Start Failed:", err);
        showToast("⚠️ 카메라 작동 오류: " + err);

        // 권한 거부 등의 경우 사용자 대응
        if (err.toString().includes("Permission")) {
            showToast("카메라 권한을 수동으로 허용해 주세요.");
        }
    }
}

function onScanSuccess(barcode) {
    // 중복 스캔 방지 로직 (1.2초)
    const now = Date.now();
    if (cart.length > 0 && cart[0].barcode === barcode && (now - cart[0].updatedAt < 1200)) {
        return;
    }

    if (navigator.vibrate) navigator.vibrate(80);
    addToCart(barcode);
    showToast("✅ 스캔 완료!");
}

// 4. 장바구니 관리 로직
function addToCart(barcode) {
    const existing = cart.find(item => item.barcode === barcode);
    if (existing) {
        existing.qty += 1;
        existing.updatedAt = Date.now();
    } else {
        const product = LOCAL_DB[barcode] || { name: `미등록 (${barcode})`, price: 12000 };
        cart.unshift({
            id: Date.now(),
            updatedAt: Date.now(),
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
        item.updatedAt = Date.now();
        if (item.qty < 1) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    render();
}

/**
 * 5. 렌더링 함수
 * 이미지 제공 화면과 100% 동일한 5열 구조 렌더링
 */
function render() {
    const listEl = document.getElementById('cart-list');
    const countEl = document.getElementById('cart-item-count');
    const totalValEl = document.getElementById('total-val');

    if (!listEl) return;

    listEl.innerHTML = cart.map(item => `
        <div class="item-row">
            <div class="item-main-box">
                <!-- 1. 제품명 -->
                <div class="col-name">
                    <span class="name-text">${item.name}</span>
                </div>
                <!-- 2. 가격과 '원' 단위 세로 배치 -->
                <div class="col-price">
                    ${(item.price * item.qty).toLocaleString()}<br>
                    <span>원</span>
                </div>
                <!-- 3. 수량 조절 - / + -->
                <div class="col-qty">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    /
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <!-- 4. 가격비교 독립 단추 -->
            <a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.name)}" target="_blank" class="item-link-box">
                가격비교 링크
            </a>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    totalValEl.innerText = total.toLocaleString();
    countEl.innerText = cart.length;
}

// 6. 유틸리티
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// 초기 로드 시 실행
window.onload = () => {
    startScanner();
    render();
};
