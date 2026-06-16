// API объявлен в shop.js, который подключён до этого файла
const token = localStorage.getItem('token');

if (!token) window.location.href = '../login/login.html';

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'acc-toast' + (type ? ' acc-toast-' + type : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2800);
}

// ── Status maps ───────────────────────────────────────────────────────────────
const STATUS_LABELS = {
    pending:    'Ожидает',
    processing: 'В обработке',
    shipped:    'Доставляется',
    delivered:  'Доставлен',
    cancelled:  'Отменён'
};
const STATUS_CSS = {
    pending: 'status-processing', processing: 'status-processing',
    shipped: 'status-processing', delivered:  'status-delivered',
    cancelled: 'status-cancelled'
};

function fmt(iso) {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

// ── Load profile ──────────────────────────────────────────────────────────────
async function loadUser() {
    const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login/login.html';
        return;
    }
    const user = await res.json();

    document.getElementById('userName').textContent  = `${user.first_name} ${user.last_name}`;
    document.getElementById('userEmail').textContent = user.email;

    document.getElementById('profileFirstName').value = user.first_name || '';
    document.getElementById('profileLastName').value  = user.last_name  || '';
    document.getElementById('profileEmail').value     = user.email      || '';
    document.getElementById('profilePhone').value     = user.phone      || '';
    const bd = document.getElementById('profileBirthday');
    if (bd && user.birthday) bd.value = user.birthday.split('T')[0];
}

// ── Load orders ───────────────────────────────────────────────────────────────
async function loadOrders() {
    const c = document.getElementById('ordersContainer');
    c.innerHTML = '<p class="acc-loading">Загрузка заказов...</p>';

    const res    = await fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
    const orders = await res.json();

    if (!orders.length) { c.innerHTML = '<p class="acc-empty">У вас пока нет заказов</p>'; return; }

    c.innerHTML = orders.map(o => `
        <div class="order-card" data-order-id="${o.id}">
            <div class="order-header">
                <div>
                    <div class="order-number">Заказ #${o.id}</div>
                    <div class="order-date">${fmt(o.created_at)}</div>
                </div>
                <span class="order-status ${STATUS_CSS[o.status] || ''}">
                    ${STATUS_LABELS[o.status] || o.status}
                </span>
            </div>
            <div class="order-items">
                ${(o.order_items || []).map(item => `
                    <div class="order-item">
                        <div class="item-img"></div>
                        <div class="item-details">
                            <div class="item-name">${item.product_name}</div>
                            <div class="item-price">
                                ${Number(item.price).toLocaleString('ru-RU')} ₽ × ${item.quantity}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">Итого: ${Number(o.total_amount).toLocaleString('ru-RU')} ₽</div>
            </div>
        </div>
    `).join('');
}

// ── Load wishlist ─────────────────────────────────────────────────────────────
async function loadWishlist() {
    const c     = document.getElementById('wishlistContainer');
    c.innerHTML = '<p class="acc-loading">Загрузка избранного...</p>';

    const res   = await fetch(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
    const items = await res.json();

    if (!items.length) { c.innerHTML = '<p class="acc-empty">В избранном пока нет товаров</p>'; return; }

    c.innerHTML = items.map(i => {
        const p    = i.products;
        const name = p.name.replace(/'/g, '&#39;');
        return `
            <div class="wishlist-item" id="wish-${p.id}">
                <div class="wishlist-img"></div>
                <div class="wishlist-details">
                    <div class="wishlist-name">${p.name}</div>
                    <div class="wishlist-price">${Number(p.price).toLocaleString('ru-RU')} ₽</div>
                    <div class="wishlist-actions">
                        <button class="btn" style="flex:1" onclick="wishToCart(${p.id},'${name}')">В корзину</button>
                        <button class="btn-icon" onclick="removeWish(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function wishToCart(productId, productName) {
    const res = await fetch(`${API}/cart`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ product_id: productId })
    });
    showToast(res.ok ? `${productName} — добавлен в корзину` : 'Ошибка', res.ok ? '' : 'error');
}

async function removeWish(productId) {
    const res = await fetch(`${API}/wishlist/${productId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        document.getElementById(`wish-${productId}`)?.remove();
        const c = document.getElementById('wishlistContainer');
        if (!c.querySelector('.wishlist-item')) {
            c.innerHTML = '<p class="acc-empty">В избранном пока нет товаров</p>';
        }
        showToast('Удалено из избранного', 'info');
    }
}

// ── Load addresses ────────────────────────────────────────────────────────────
async function loadAddresses() {
    const c     = document.getElementById('addressesContainer');
    c.innerHTML = '<p class="acc-loading">Загрузка адресов...</p>';

    const res  = await fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
    const list = await res.json();

    if (!list.length) { c.innerHTML = '<p class="acc-empty">Адреса не добавлены</p>'; return; }

    c.innerHTML = list.map(a => `
        <div class="address-card ${a.is_default ? 'default' : ''}">
            <div class="address-header">
                <div class="address-title">${a.title || 'Адрес'}</div>
                ${a.is_default ? '<span class="default-badge">По умолчанию</span>' : ''}
            </div>
            <div class="address-details">
                <p><strong>${a.full_name}</strong></p>
                <p>${a.city}, ${a.street}</p>
                ${a.postal_code ? `<p>Индекс: ${a.postal_code}</p>` : ''}
                ${a.phone ? `<p>Телефон: ${a.phone}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// ── Profile save ──────────────────────────────────────────────────────────────
document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = this.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Сохранение...';

    const res = await fetch(`${API}/users/me`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
            first_name: document.getElementById('profileFirstName').value,
            last_name:  document.getElementById('profileLastName').value,
            phone:      document.getElementById('profilePhone').value || null,
            birthday:   document.getElementById('profileBirthday')?.value || undefined
        })
    });

    if (res.ok) {
        const user = await res.json();
        document.getElementById('userName').textContent = `${user.first_name} ${user.last_name}`;
        showToast('Профиль обновлён');
    } else {
        showToast('Ошибка сохранения', 'error');
    }

    btn.disabled = false; btn.textContent = 'Сохранить изменения';
});

// ── Password change ───────────────────────────────────────────────────────────
document.getElementById('securityForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const newPwd = document.getElementById('newPassword').value;
    if (newPwd !== document.getElementById('confirmNewPassword').value) {
        showToast('Пароли не совпадают', 'error'); return;
    }
    const btn = this.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Сохранение...';

    const res  = await fetch(`${API}/users/me/password`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
            current_password: document.getElementById('currentPassword').value,
            new_password:     newPwd
        })
    });
    const data = await res.json();
    if (res.ok) { showToast('Пароль изменён'); this.reset(); }
    else         { showToast(data.error || 'Ошибка', 'error'); }

    btn.disabled = false; btn.textContent = 'Изменить пароль';
});

// ── Address modal ─────────────────────────────────────────────────────────────
function openAddressModal() {
    document.getElementById('addrModalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAddressModal() {
    document.getElementById('addrModalOverlay').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('addrForm').reset();
}

document.getElementById('addAddressBtn')?.addEventListener('click', openAddressModal);
document.getElementById('addrModalClose')?.addEventListener('click', closeAddressModal);
document.getElementById('addrCancelBtn')?.addEventListener('click', closeAddressModal);
document.getElementById('addrModalOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) closeAddressModal();
});

document.getElementById('addrForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('addrSubmitBtn');
    btn.disabled = true; btn.textContent = 'Сохранение...';

    const res = await fetch(`${API}/addresses`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
            title:       document.getElementById('aTitle').value.trim()    || null,
            full_name:   document.getElementById('aFullName').value.trim(),
            city:        document.getElementById('aCity').value.trim(),
            street:      document.getElementById('aStreet').value.trim(),
            postal_code: document.getElementById('aPostal').value.trim()   || null,
            phone:       document.getElementById('aPhone').value.trim()    || null,
            is_default:  document.getElementById('aDefault').checked
        })
    });

    if (res.ok) {
        closeAddressModal();
        showToast('Адрес добавлен');
        loadAddresses();
    } else {
        const d = await res.json();
        showToast(d.error || 'Ошибка', 'error');
    }

    btn.disabled = false; btn.textContent = 'Сохранить адрес';
});

// ── Tab switching ─────────────────────────────────────────────────────────────
const tabLoaders = { orders: loadOrders, wishlist: loadWishlist, addresses: loadAddresses };

document.querySelectorAll('.sidebar-menu a[data-tab]').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.sidebar-menu a').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const id = this.getAttribute('data-tab');
        document.getElementById(id + '-tab').classList.add('active');
        if (tabLoaders[id]) tabLoaders[id]();
    });
});

// ── Mobile menu ───────────────────────────────────────────────────────────────
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () =>
    document.querySelector('.nav-links')?.classList.toggle('active')
);

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index/index.html';
});

// ── Init ──────────────────────────────────────────────────────────────────────
loadUser();

// Открыть нужную вкладку из URL-хэша (#wishlist, #addresses, #profile, #security)
const hashTab = location.hash.replace('#', '');
if (hashTab && document.querySelector(`[data-tab="${hashTab}"]`)) {
    document.querySelector(`[data-tab="${hashTab}"]`).click();
} else {
    loadOrders();
}

// ── Socket.io — real-time обновление статуса заказа ──────────────────────────
(function connectSocket() {
    if (typeof io === 'undefined') return; // socket.io не подключён

    const socket = io(API);

    socket.on('order:updated', ({ orderId, userId, status }) => {
        // Проверяем что заказ принадлежит текущему пользователю
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id && currentUser.id !== userId) return;
        } catch { /* ignore */ }

        // Обновляем бейдж статуса без перезагрузки страницы
        const card = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!card) return;

        const badge = card.querySelector('.order-status');
        if (badge) {
            badge.textContent = STATUS_LABELS[status] || status;
            badge.className   = `order-status ${STATUS_CSS[status] || ''}`;

            // Небольшая анимация чтобы изменение было заметно
            badge.style.transition = 'opacity 0.2s';
            badge.style.opacity    = '0.3';
            setTimeout(() => { badge.style.opacity = '1'; }, 150);
        }

        showToast(`Статус заказа #${orderId} обновлён: ${STATUS_LABELS[status] || status}`);
    });
})();
