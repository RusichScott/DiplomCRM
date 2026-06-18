const API = 'http://localhost:3000';

// ── Shared styles (modal + toast) — injected so any page using shop.js gets them ──
(function injectShopStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .auth-modal-overlay {
            position: fixed; inset: 0;
            background: rgba(15,5,30,0.65);
            backdrop-filter: blur(4px);
            z-index: 2000;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: opacity 0.25s;
        }
        .auth-modal-overlay.active { opacity: 1; pointer-events: all; }
        .auth-modal-card {
            background: white; border-radius: 20px;
            padding: 44px 40px; max-width: 380px; width: 90%;
            text-align: center; position: relative;
            transform: scale(0.94) translateY(10px);
            transition: transform 0.25s;
            box-shadow: 0 24px 64px rgba(96,23,156,0.22);
        }
        .auth-modal-overlay.active .auth-modal-card { transform: scale(1) translateY(0); }
        .auth-modal-close {
            position: absolute; top: 16px; right: 18px;
            background: none; border: none; font-size: 22px;
            color: #888; cursor: pointer; transition: color 0.2s;
        }
        .auth-modal-close:hover { color: #222; }
        .auth-modal-icon {
            width: 64px; height: 64px; border-radius: 50%;
            background: #f3eeff;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; font-size: 28px; color: #7c3aed;
        }
        .auth-modal-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px; }
        .auth-modal-card p { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
        .auth-modal-btns { display: flex; flex-direction: column; gap: 10px; }
        .auth-modal-btn-primary {
            display: block;
            background: linear-gradient(135deg, #a855f7, #7c3aed);
            color: white; padding: 13px; border-radius: 8px;
            text-decoration: none; font-size: 14px; font-weight: 600;
            letter-spacing: 0.5px; transition: all 0.3s;
            box-shadow: 0 4px 16px rgba(96,23,156,0.28);
        }
        .auth-modal-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .auth-modal-btn-outline {
            display: block; background: transparent; color: #7c3aed;
            padding: 12px; border-radius: 8px; text-decoration: none;
            font-size: 14px; font-weight: 500;
            border: 1px solid #7c3aed; transition: all 0.3s;
        }
        .auth-modal-btn-outline:hover { background: #f3eeff; }
        .shop-toast {
            position: fixed; bottom: 28px; left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #1a1a2e; color: white;
            padding: 13px 24px; border-radius: 10px;
            font-size: 14px; font-weight: 500; z-index: 3000;
            opacity: 0; transition: opacity 0.3s, transform 0.3s;
            white-space: nowrap; pointer-events: none;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .shop-toast.shop-toast-show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .shop-toast.shop-toast-error { background: #c62828; }
        .shop-toast.shop-toast-info  { background: #555; }
    `;
    document.head.appendChild(style);
})();

// ── Auth Modal ────────────────────────────────────────────────────────────────
(function injectAuthModal() {
    const el = document.createElement('div');
    el.id = 'authModal';
    el.className = 'auth-modal-overlay';
    el.innerHTML = `
        <div class="auth-modal-card">
            <button class="auth-modal-close" id="authModalClose">&times;</button>
            <div class="auth-modal-icon"><i class="fas fa-user-circle"></i></div>
            <h3>Войдите в аккаунт</h3>
            <p>Для добавления товаров в корзину или избранное необходимо войти или создать аккаунт</p>
            <div class="auth-modal-btns">
                <a href="../login/login.html" class="auth-modal-btn-primary">Войти</a>
                <a href="../registration/registration.html" class="auth-modal-btn-outline">Зарегистрироваться</a>
            </div>
        </div>
    `;
    document.body.appendChild(el);

    document.getElementById('authModalClose').addEventListener('click', hideAuthModal);
    el.addEventListener('click', e => { if (e.target === el) hideAuthModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hideAuthModal(); });
})();

function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showShopToast(message, type) {
    const t = document.createElement('div');
    t.className = 'shop-toast' + (type ? ' shop-toast-' + type : '');
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('shop-toast-show')));
    setTimeout(() => {
        t.classList.remove('shop-toast-show');
        setTimeout(() => t.remove(), 350);
    }, 2800);
}

// ── Cart ──────────────────────────────────────────────────────────────────────
async function addToCart(productId, productName) {
    const token = localStorage.getItem('token');
    if (!token) { showAuthModal(); return; }

    try {
        const res = await fetch(`${API}/cart`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ product_id: productId })
        });

        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showAuthModal();
            return;
        }

        if (!res.ok) {
            const d = await res.json();
            showShopToast(d.error || 'Ошибка', 'error');
            return;
        }

        showShopToast(`${productName} — добавлен в корзину`);
    } catch {
        showShopToast('Нет связи с сервером', 'error');
    }
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
async function toggleWishlist(productId, productName, btn) {
    const token = localStorage.getItem('token');
    if (!token) { showAuthModal(); return; }

    const inWishlist = btn.classList.contains('wish-active');
    const icon = btn.querySelector('i');

    try {
        const res = await fetch(
            inWishlist ? `${API}/wishlist/${productId}` : `${API}/wishlist`,
            {
                method:  inWishlist ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                ...(inWishlist ? {} : { body: JSON.stringify({ product_id: productId }) })
            }
        );

        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showAuthModal();
            return;
        }

        if (res.status === 409) {
            btn.classList.add('wish-active');
            if (icon) icon.className = 'fas fa-heart';
            return;
        }

        if (!res.ok) return;

        if (inWishlist) {
            btn.classList.remove('wish-active');
            if (icon) icon.className = 'far fa-heart';
            showShopToast('Удалено из избранного', 'info');
        } else {
            btn.classList.add('wish-active');
            if (icon) icon.className = 'fas fa-heart';
            showShopToast(`${productName} — добавлен в избранное`);
        }
    } catch {
        showShopToast('Нет связи с сервером', 'error');
    }
}

// ── Mark wishlist buttons on page load ────────────────────────────────────────
async function markWishlistButtons() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const items = await res.json();
        const ids = new Set(items.map(i => i.product_id));

        document.querySelectorAll('[data-product-id]').forEach(card => {
            const id = Number(card.dataset.productId);
            if (ids.has(id)) {
                const btn = card.querySelector('.wish-btn');
                if (btn) {
                    btn.classList.add('wish-active');
                    const icon = btn.querySelector('i');
                    if (icon) icon.className = 'fas fa-heart';
                }
            }
        });
    } catch { /* ignore */ }
}

// ── Product card builder ──────────────────────────────────────────────────────
function buildProductCard(p) {
    const price    = Number(p.price).toLocaleString('ru-RU') + ' ₽';
    const oldPrice = p.old_price
        ? `<span class="product-old-price">${Number(p.old_price).toLocaleString('ru-RU')} ₽</span>`
        : '';
    const badge    = p.is_new ? '<span class="product-badge">Новинка</span>' : '';
    const imgStyle = p.product_images?.image_url
        ? `background-image: url('${p.product_images.image_url}')`
        : '';
    const name     = p.name.replace(/'/g, '&apos;').replace(/"/g, '&quot;');

    return `
        <div class="product-card" data-product-id="${p.id}">
            ${badge}
            <div class="product-img" style="${imgStyle}"></div>
            <div class="product-content">
                <h3 class="product-title">${p.name}</h3>
                <div class="product-footer">
                    <div class="product-prices">
                        <span class="product-price">${price}</span>
                        ${oldPrice}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn cart-btn" title="В корзину"
                            onclick="addToCart(${p.id}, '${name}')">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                        <button class="action-btn wish-btn" title="В избранное"
                            onclick="toggleWishlist(${p.id}, '${name}', this)">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
