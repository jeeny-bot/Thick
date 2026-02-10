/**
 * Thick Scanner - Orange Pro Engine
 * 안정성 강화 및 기기 호환성 최적화 버전
 */

// 1. 제품 데이터
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
    const readerEl = document.getElementById("reader");
    if (!readerEl) return;

    try {
        html5QrCode = new Html5Qrcode("reader");

        // 카메라 권한 및 기기 목록 확인
        const cameras = await Html5Qrcode.getCameras();

        if (cameras && cameras.length > 0) {
            // 후면 카메라 우선 선택 (일반적으로 마지막 카메라 기기)
            const cameraId = cameras[cameras.length - 1].id;

            const config = {
                fps: 20,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            await html5QrCode.start(
                cameraId,
                config,
                (decodedText) => {
                    onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // 스캔 중인 상태 (무시 가능)
                }
            );
            console.log("Scanner started with camera:", cameraId);
        } else {
            // 카메라가 없을 경우 기본 faceMode 사용
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 20, qrbox: { width: 250, height: 150 } },
                onScanSuccess
            );
        }
    } catch (err) {
        console.error("Scanner Error:", err);
        showToast("⚠️ 카메라 연결 실패: " + err);

        // 에러 발생 시 재시도 버튼 표시 등 추가 처리가 필요할 수 있음
    }
}

function onScanSuccess(barcode) {
    // 1초 이내 동일 바코드 중복 스캔 방지
    if (cart.length > 0 && cart[0].barcode === barcode && (Date.now() - cart[0].id < 1200)) {
        return;
    }

    if (navigator.vibrate) navigator.vibrate(80);
    addToCart(barcode);
    showToast("✅ 스캔 완료!");
}

// 4. 장바구니 로직
function addToCart(barcode) {
    const existing = cart.find(item => item.barcode === barcode);
    if (existing) {
        existing.qty += 1;
    } else {
        const product = LOCAL_DB[barcode] || { name: `미등록 (${barcode})`, price: 4000 };
        cart.unshift({ // 최신 항목이 위로 오도록
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

    if (!listEl) return;

    listEl.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div class="cart-item">
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
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
    startScanner();
    render();
};
