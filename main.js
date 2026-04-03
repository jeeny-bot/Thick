// main.js

// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Dummy database of products
const productDatabase = {
    '690348777139': { // Dummy barcode from image
        name: '신라면 컵',
        imageUrl: 'https://i.namu.wiki/i/5Vj-A_2F2k9c-2z-2I-1e24_JQbXg2g4gSgG-A7z-C2g1a3g-hJ2i-kXk-vV-p-pC-g-z-X-sV-aX-kXg-i.webp',
        stores: [
            { name: 'CU', price: 1500 },
            { name: 'GS25', price: 1400 },
            { name: '동네마트', price: 980 }
        ]
    },
    'default': {
        name: '상품 정보 없음',
        imageUrl: '',
        stores: []
    }
};

// --- Page specific logic ---

function loadRegisteredProducts() {
    try {
        return JSON.parse(localStorage.getItem('thickRegisteredProducts') || '[]');
    } catch (e) {
        return [];
    }
}

function saveRegisteredProducts(products) {
    localStorage.setItem('thickRegisteredProducts', JSON.stringify(products));
}

function renderRegisteredProducts() {
    const listEl = document.getElementById('registered-products');
    if (!listEl) return;

    const products = loadRegisteredProducts();
    if (!products.length) {
        listEl.innerHTML = '<div style="color: var(--text-secondary);">등록된 상품이 없습니다.</div>';
        return;
    }

    listEl.innerHTML = products.map((p, idx) => `
        <div style="background: rgba(255,255,255,0.08); padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
            <div style="font-weight: 700; color: #f7d7aa;">${p.name}</div>
            <div style="font-size: 14px; color: #c9b09a;">바코드: ${p.barcode || '-'} / 등록일: ${p.createdAt || '-'} </div>
        </div>
    `).join('');
}

function setupProductInfoPage() {
    const barcode = getQueryParam('barcode');
    const product = productDatabase[barcode] || { name: '등록할 상품을 선택해주세요', imageUrl: 'https://via.placeholder.com/220?text=No+Image', stores: [] };

    document.getElementById('product-image').src = product.imageUrl;
    document.getElementById('product-name').textContent = product.name;

    const status = document.getElementById('product-status');
    if (barcode) {
        status.textContent = `바코드 ${barcode} 검색 완료. 등록을 눌러 목록에 추가하세요.`;
    } else {
        status.textContent = '바코드를 읽은 후 상품 등록을 진행하세요.';
    }

    document.getElementById('register-btn').onclick = () => {
        const products = loadRegisteredProducts();

        const exists = products.find(item => item.barcode === barcode);
        if (!barcode) {
            alert('등록할 바코드가 없습니다. 스캔 후 시도해주세요.');
            return;
        } else if (exists) {
            alert('이미 등록된 상품입니다.');
            return;
        }

        products.unshift({
            barcode,
            name: product.name,
            imageUrl: product.imageUrl,
            createdAt: new Date().toLocaleString()
        });

        saveRegisteredProducts(products);
        renderRegisteredProducts();
        alert('상품이 등록되었습니다!');
    };

    renderRegisteredProducts();
}


function setupPriceInputPage() {
    const productName = getQueryParam('product');
    const storeName = getQueryParam('store');
    const price = getQueryParam('price');

    document.querySelector('.product-name').textContent = productName;
    document.querySelector('.price-input').value = price;

    // Highlight selected store
    const buttons = document.querySelectorAll('.store-selector button');
    buttons.forEach(button => {
        if (button.textContent === storeName) {
            button.classList.add('selected');
        }
        button.onclick = () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        };
    });
    
    document.querySelector('.save-button').onclick = () => {
        alert('가격이 저장되었습니다!');
        window.location.href = 'map.html';
    };
}

// --- Main execution ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id === 'product-info-page') {
        setupProductInfoPage();
    } else if (document.body.id === 'price-input-page') {
        setupPriceInputPage();
    }
});
