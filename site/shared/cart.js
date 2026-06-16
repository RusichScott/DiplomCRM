// ── Корзина + оформление заказа ──────────────────────────────────────────────
// Зависит от shop.js (API, showAuthModal, showShopToast) — подключать после него

// ── Inject styles ─────────────────────────────────────────────────────────────
(function injectCartStyles() {
    const s = document.createElement('style');
    s.textContent = `
/* Overlay */
.cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1500;
  opacity:0;pointer-events:none;transition:opacity .3s}
.cart-overlay.active{opacity:1;pointer-events:all}

/* Sidebar */
.cart-sidebar{position:fixed;top:0;right:-420px;width:100%;max-width:400px;
  height:100vh;background:#fff;z-index:1600;display:flex;flex-direction:column;
  box-shadow:-8px 0 40px rgba(0,0,0,.12);
  transition:right .35s cubic-bezier(.4,0,.2,1)}
.cart-sidebar.open{right:0}

.cart-hdr{display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid #ece5f5}
.cart-hdr h3{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#1e1b2e}
.cart-close-btn{background:none;border:none;font-size:26px;color:#bbb;cursor:pointer;
  line-height:1;transition:color .2s}
.cart-close-btn:hover{color:#1e1b2e}

.cart-list{flex:1;overflow-y:auto;padding:16px 24px;display:flex;flex-direction:column;gap:12px}

.cart-item-card{display:flex;align-items:center;gap:12px;padding:12px;
  border:1px solid #ece5f5;border-radius:12px;background:#f8f5fc}
.cart-item-img{width:52px;height:52px;flex-shrink:0;border-radius:8px;background:#ede4f7}
.cart-item-info{flex:1;min-width:0}
.cart-item-name{font-size:13px;font-weight:500;color:#1e1b2e;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px}
.cart-item-price{font-size:12px;color:#60179c;font-weight:600}
.cart-item-del{background:none;border:none;cursor:pointer;color:#ccc;font-size:16px;
  padding:4px;transition:color .2s;flex-shrink:0}
.cart-item-del:hover{color:#e91e63}

.cart-empty-state{flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:12px;color:#bbb;text-align:center;padding:40px}
.cart-empty-state svg{opacity:.35}
.cart-empty-sub{font-size:13px}

.cart-loading-txt,.cart-err-txt{text-align:center;padding:40px;
  color:#999;font-size:14px}
.cart-err-txt{color:#e91e63}

.cart-ftr{padding:20px 24px;border-top:1px solid #ece5f5;background:#fff}
.cart-total-row{display:flex;justify-content:space-between;align-items:center;
  margin-bottom:16px;font-size:15px;font-weight:500;color:#1e1b2e}
.cart-total-val{font-family:'Cormorant Garamond',serif;font-size:22px;
  font-weight:700;color:#60179c}
.cart-checkout-btn{width:100%;padding:14px;
  background:linear-gradient(135deg,#8b35cc,#3d0f63);
  color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;
  font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:.5px;
  transition:all .3s;box-shadow:0 4px 16px rgba(96,23,156,.3)}
.cart-checkout-btn:hover{opacity:.9;transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(96,23,156,.4)}
.cart-checkout-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* ── Checkout modal ── */
.co-overlay{position:fixed;inset:0;background:rgba(15,5,30,.65);
  backdrop-filter:blur(4px);z-index:2000;
  display:flex;align-items:center;justify-content:center;
  opacity:0;pointer-events:none;transition:opacity .25s}
.co-overlay.active{opacity:1;pointer-events:all}
.co-card{background:#fff;border-radius:20px;width:90%;max-width:480px;
  max-height:90vh;overflow-y:auto;
  transform:scale(.94) translateY(10px);transition:transform .25s;
  box-shadow:0 24px 64px rgba(96,23,156,.22)}
.co-overlay.active .co-card{transform:scale(1) translateY(0)}

.co-hdr{display:flex;align-items:center;justify-content:space-between;
  padding:22px 28px;border-bottom:1px solid #ece5f5;
  position:sticky;top:0;background:#fff;z-index:1}
.co-hdr h3{font-family:'Cormorant Garamond',serif;font-size:24px;
  font-weight:600;color:#1e1b2e}
.co-close{background:none;border:none;font-size:24px;color:#bbb;cursor:pointer;
  transition:color .2s}
.co-close:hover{color:#1e1b2e}

.co-form{padding:22px 28px;display:flex;flex-direction:column;gap:16px}

.co-field{display:flex;flex-direction:column;gap:6px}
.co-field label{font-size:11px;font-weight:600;color:#888;
  text-transform:uppercase;letter-spacing:.7px}
.co-field input,.co-select,.co-textarea{
  width:100%;padding:12px 14px;border:1px solid #ece5f5;border-radius:8px;
  font-size:14px;font-family:'Inter',sans-serif;color:#1e1b2e;
  background:#fff;transition:all .25s}
.co-field input:focus,.co-select:focus,.co-textarea:focus{
  outline:none;border-color:#60179c;box-shadow:0 0 0 3px rgba(96,23,156,.07)}
.co-select{cursor:pointer}
.co-textarea{resize:vertical}

.co-actions{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.co-btn-submit{width:100%;padding:14px;
  background:linear-gradient(135deg,#8b35cc,#3d0f63);color:#fff;border:none;
  border-radius:8px;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;
  cursor:pointer;letter-spacing:.5px;transition:all .3s;
  box-shadow:0 4px 16px rgba(96,23,156,.3)}
.co-btn-submit:hover{opacity:.9;transform:translateY(-2px)}
.co-btn-submit:disabled{opacity:.55;cursor:not-allowed;transform:none}
.co-btn-cancel{width:100%;padding:13px;background:transparent;
  border:1px solid #ece5f5;border-radius:8px;font-size:14px;color:#999;
  cursor:pointer;transition:all .3s;font-family:'Inter',sans-serif}
.co-btn-cancel:hover{border-color:#60179c;color:#60179c}
    `;
    document.head.appendChild(s);
})();

// ── Inject HTML ───────────────────────────────────────────────────────────────
(function injectCartHTML() {
    document.body.insertAdjacentHTML('beforeend', `
    <!-- Cart overlay -->
    <div id="cartOverlay" class="cart-overlay"></div>

    <!-- Cart sidebar -->
    <div id="cartSidebar" class="cart-sidebar">
        <div class="cart-hdr">
            <h3>Корзина</h3>
            <button class="cart-close-btn" id="cartCloseBtn">&times;</button>
        </div>
        <div class="cart-list" id="cartList"></div>
        <div class="cart-empty-state" id="cartEmpty" style="display:none">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p>Корзина пуста</p>
            <p class="cart-empty-sub">Добавьте товары из каталога</p>
        </div>
        <div class="cart-ftr" id="cartFtr" style="display:none">
            <div class="cart-total-row">
                <span>Итого:</span>
                <span class="cart-total-val" id="cartTotalVal"></span>
            </div>
            <button class="cart-checkout-btn" id="cartCheckoutBtn">Оформить заказ</button>
        </div>
    </div>

    <!-- Checkout overlay -->
    <div id="coOverlay" class="co-overlay">
        <div class="co-card">
            <div class="co-hdr">
                <h3>Оформление заказа</h3>
                <button class="co-close" id="coCloseBtn">&times;</button>
            </div>
            <form class="co-form" id="orderForm">
                <div class="co-field">
                    <label>Имя получателя</label>
                    <input type="text" id="coName" placeholder="Иван Иванов" required>
                </div>
                <div class="co-field">
                    <label>Телефон</label>
                    <input type="tel" id="coPhone" placeholder="+7 (999) 123-45-67" required>
                </div>
                <div class="co-field" id="coAddrField">
                    <label>Адрес доставки</label>
                    <select class="co-select" id="coAddrSelect" style="display:none"></select>
                    <textarea class="co-textarea" id="coAddrText"
                        placeholder="Город, улица, дом, квартира" rows="2"></textarea>
                </div>
                <div class="co-field">
                    <label>Комментарий (необязательно)</label>
                    <textarea class="co-textarea" id="coComment"
                        placeholder="Особые пожелания к заказу" rows="2"></textarea>
                </div>
                <div class="co-actions">
                    <button type="submit" class="co-btn-submit" id="coSubmitBtn">Оформить заказ</button>
                    <button type="button" class="co-btn-cancel" id="coCancelBtn">Отмена</button>
                </div>
            </form>
        </div>
    </div>
    `);

    // Bind events
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
    document.getElementById('cartCheckoutBtn').addEventListener('click', openCheckout);
    document.getElementById('coCloseBtn').addEventListener('click', closeCheckout);
    document.getElementById('coCancelBtn').addEventListener('click', closeCheckout);
    document.getElementById('coOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('coOverlay')) closeCheckout();
    });
    document.getElementById('coAddrSelect').addEventListener('change', function () {
        document.getElementById('coAddrText').style.display =
            this.value === 'new' || this.value === '' ? '' : 'none';
    });
    document.getElementById('orderForm').addEventListener('submit', submitOrder);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeCart(); closeCheckout(); }
    });

    // Bind cart trigger buttons
    document.querySelectorAll('[data-cart-trigger]').forEach(el => {
        el.addEventListener('click', openCart);
    });
})();

// ── Cart logic ────────────────────────────────────────────────────────────────
function openCart() {
    const token = localStorage.getItem('token');
    if (!token) { showAuthModal(); return; }
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadCart();
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

async function loadCart() {
    const token  = localStorage.getItem('token');
    const listEl = document.getElementById('cartList');
    const ftrEl  = document.getElementById('cartFtr');
    const emptyEl = document.getElementById('cartEmpty');

    listEl.innerHTML = '<p class="cart-loading-txt">Загрузка...</p>';
    ftrEl.style.display  = 'none';
    emptyEl.style.display = 'none';

    try {
        const res = await fetch(`${API}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const items = await res.json();

        if (!items.length) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'flex';
            return;
        }

        const total = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
        document.getElementById('cartTotalVal').textContent =
            total.toLocaleString('ru-RU') + ' ₽';

        listEl.innerHTML = items.map(i => `
            <div class="cart-item-card">
                <div class="cart-item-img"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${i.products.name}</div>
                    <div class="cart-item-price">
                        ${Number(i.products.price).toLocaleString('ru-RU')} ₽ × ${i.quantity}
                    </div>
                </div>
                <button class="cart-item-del" onclick="removeFromCartSidebar(${i.product_id})" title="Удалить">
                    &times;
                </button>
            </div>
        `).join('');

        ftrEl.style.display = '';

    } catch {
        listEl.innerHTML = '<p class="cart-err-txt">Ошибка загрузки корзины</p>';
    }
}

async function removeFromCartSidebar(productId) {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API}/cart/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        loadCart();
    } catch {
        showShopToast('Ошибка при удалении', 'error');
    }
}

// ── Checkout logic ────────────────────────────────────────────────────────────
async function openCheckout() {
    document.getElementById('coOverlay').classList.add('active');

    // Pre-fill name from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
        const u = JSON.parse(stored);
        document.getElementById('coName').value = `${u.first_name} ${u.last_name}`.trim();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Phone from profile
        const res = await fetch(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            if (user.phone) document.getElementById('coPhone').value = user.phone;
        }

        // Saved addresses
        const addrRes = await fetch(`${API}/addresses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (addrRes.ok) {
            const addresses = await addrRes.json();
            const sel = document.getElementById('coAddrSelect');
            if (addresses.length) {
                sel.innerHTML =
                    addresses.map(a =>
                        `<option value="${a.id}">${a.title || 'Адрес'}: ${a.city}, ${a.street}</option>`
                    ).join('') +
                    '<option value="new">Ввести другой адрес...</option>';
                sel.style.display = '';
                // Hide manual input if saved address selected
                document.getElementById('coAddrText').style.display = 'none';
            } else {
                sel.style.display = 'none';
                document.getElementById('coAddrText').style.display = '';
            }
        }
    } catch { /* ignore */ }
}

function closeCheckout() {
    document.getElementById('coOverlay').classList.remove('active');
}

async function submitOrder(e) {
    e.preventDefault();
    const token  = localStorage.getItem('token');
    const btn    = document.getElementById('coSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Оформляем...';

    const sel       = document.getElementById('coAddrSelect');
    const addrId    = sel.style.display !== 'none' && sel.value && sel.value !== 'new'
        ? Number(sel.value) : null;
    const comment   = document.getElementById('coComment').value.trim() || null;

    try {
        const res = await fetch(`${API}/orders`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ address_id: addrId, comment })
        });

        if (!res.ok) {
            const d = await res.json();
            showShopToast(d.error || 'Ошибка оформления', 'error');
            return;
        }

        closeCheckout();
        closeCart();
        showShopToast('Заказ успешно оформлен! Ожидайте подтверждения.');
        document.getElementById('orderForm').reset();

    } catch {
        showShopToast('Не удалось оформить заказ', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Оформить заказ';
    }
}
