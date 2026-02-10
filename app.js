/**
 * Thick Scanner - Pixel Perfect Logic
 * 이미지와 동일한 UX/기능 구현 및 스캐너 안정성 강화
 */

// 1. 제품 DB
const PRODUCT_DB = {
    "8801048101037": { name: "상품명", price: 4000 },
    "8801056154018": { name: "상품명", price: 4000 },
    "8801043014783": { name: "상품명", price: 4000 },
    "8801052028634": { name: "상품명", price: 4000 },
    "88023014": { name: "상품명", price: 4000 }
};

// 2. 상태 변수
let cart = [];
let html5QrCode = null;

// 3. 스캐너 엔진 초기화 (안정성 강화 버전)
async function initScanner() {
    try {
        if (html5QrCode) {
            try { await html5QrCode.stop(); } catch (e) { }
        }

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 120 },
            aspectRatio: 1.0,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        // 기기 목록 확인 및 실행
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => onScanSuccess(decodedText)
        );
        console.log("Scanner Started Successfully");
    } catch (err) {
        console.error("Scanner Error:", err);
        showToast("⚠️ 카메라 작동 오류: " + err);
    }
}

function onScanSuccess(barcode) {
    // 중복 스캔 방지 (1.5초)
    const now = Date.now();
    if (cart.length > 0 && cart[0].barcode === barcode && (now - cart[0].updatedAt < 1500)) {
        return;
    }

    if (navigator.vibrate) navigator.vibrate(80);
    addToCart(barcode);
    showToast("✅ 스캔 성공!");
}

// 4. 리스트 및 장바구니 로직
function addToCart(barcode) {
    const existing = cart.find(item => item.barcode === barcode);
    if (existing) {
        existing.qty += 1;
        existing.updatedAt = Date.now();
    } else {
        const product = PRODUCT_DB[barcode] || { name: "상품명", price: 4000 };
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
 * 이미지와 100% 동일한 5열 구조 재현
 */
function render() {
    const listEl = document.getElementById('cart-list');
    const countEl = document.getElementById('cart-item-count');
    const totalValEl = document.getElementById('total-val');

    if (!listEl) return;

    listEl.innerHTML = cart.map(item => `
        <div class="item-row-entry">
            <!-- 제품 정보 화이트 박스 -->
            <div class="item-main-details">
                <span class="item-name-col">${item.name}</span>
                <span class="item-price-col">${(item.price * item.qty).toLocaleString()}원</span>
                <div class="item-qty-col">
                    <button class="qty-action-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    /
                    <button class="qty-action-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <!-- 가격비교 별도 화이트 박스 -->
            <a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.name)}" target="_blank" class="item-link-entry">
                가격비교 링크
            </a>
        </div>
    `).join('');

    // 초기 이미지처럼 데이터가 있을 때 보여주기 위해 샘플 데이터 (임시)
    if (cart.length === 0 && listEl.innerHTML === "") {
        // 실제 운영 시에는 제거하거나 주석 처리
        /*
        addToCart("sample1");
        addToCart("sample2");
        */
    }

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

window.onload = () => {
    initScanner();
    render();
};
