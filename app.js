/**
 * 띡띡! THICK - Smart Scanner Pro Engine
 * [안정성 강화 버전]
 */

// 1. 가상 데이터베이스
const MOCK_DB = {
    "8801048101037": { name: "BOW SuB", sub: "kiolcr sub", price: 18000, value: 111, type: "badge" },
    "8801056154018": { name: "BLW Stad", sub: "Motwilbr-20002", price: 3000, value: 1000, type: "price" },
    "8801043014783": { name: "Quit woy", sub: "Standard Item", price: 1500, value: 2000, type: "action" }
};

// 2. 상태 관리
let cart = [];
let html5QrCode = null;

// 3. 스캐너 엔진 초기화
async function initScanner() {
    try {
        // 기존 인스턴스가 있다면 정리
        if (html5QrCode) {
            await html5QrCode.stop();
        }

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 24, // 인식률을 위해 FPS 상향
            qrbox: { width: 220, height: 110 }, // 이미지의 레티클 크기와 일치
            aspectRatio: 1.0,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };

        // 도메인 보안 컨텍스트 확인 로그 (디버그용)
        console.log("Secure Context:", window.isSecureContext);

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
            }
        );

        console.log("Scanner Started Successfully");
    } catch (err) {
        console.error("Scanner Error:", err);
        // 사용자에게 친절한 에러 메시지
        if (err.toString().includes("Permission")) {
            showToast("카메라 권한이 필요합니다.");
        } else {
            showToast("스캐너 시작 실패: " + err);
        }
    }
}

function onScanSuccess(barcode) {
    if (navigator.vibrate) navigator.vibrate(100);

    // 중복 스캔 방지 (0.5초 간격)
    if (cart.length > 0 && cart[0].barcode === barcode && (Date.now() - cart[0].id < 1000)) {
        return;
    }

    addToCart(barcode);
    showToast("SUCCESS!");
}

// 4. 장바구니 관리
function addToCart(barcode) {
    const product = MOCK_DB[barcode] || {
        name: "New Product",
        sub: `CODE: ${barcode}`,
        price: Math.floor(Math.random() * 20000),
        value: Math.floor(Math.random() * 5000),
        type: cart.length % 3 === 0 ? "badge" : (cart.length % 3 === 1 ? "action" : "price")
    };

    // 가장 최근 스캔이 위로 오도록 추가
    cart.unshift({
        id: Date.now(),
        barcode,
        ...product
    });

    render();
}

function render() {
    const container = document.getElementById('cart-list');
    const countEl = document.getElementById('cart-item-count');
    const emptyMsg = document.getElementById('empty-msg');

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        countEl.innerText = "0 Cart item";
        return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    countEl.innerText = `${cart.length} Cart item`;

    // 이미지의 하이엔드 카드 스타일 3종을 순환 렌더링
    container.innerHTML = cart.map((item) => {
        if (item.type === "badge") {
            return `
                <div class="item-card">
                    <div class="item-main">
                        <span class="item-label">Cart item</span>
                        <h4 class="item-name">${item.name}</h4>
                        <span class="item-sub">${item.sub}</span>
                    </div>
                    <div class="item-val-badge">${item.value.toLocaleString()}</div>
                </div>
            `;
        } else if (item.type === "action") {
            return `
                <div class="item-card">
                    <div class="item-main">
                        <span class="item-label">Quit woy</span>
                        <button class="btn-blue-action">BT compare</button>
                    </div>
                    <div class="item-val-badge">${item.value.toLocaleString()}</div>
                </div>
            `;
        } else {
            return `
                <div class="item-card price-focus">
                    <div class="item-main">
                        <span class="item-label">Cart item</span>
                        <h4 class="item-name">${item.name}</h4>
                        <span class="item-sub">${item.sub}</span>
                    </div>
                    <div class="price-display" style="text-align: right;">
                        <span class="item-label">item price</span>
                        <span class="price-val">D${item.price.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// 5. 유틸리티
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// 초기 로드
window.onload = () => {
    initScanner();
    render();
};
