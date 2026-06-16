const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
        
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
            
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        const searchBtn = document.getElementById('searchBtn');
        searchBtn.addEventListener('click', () => {
            const query = prompt('Введите поисковый запрос:');
            if (query) {
                alert(`Поиск: ${query}\n(Функция поиска в разработке)`);
            }
        });
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.category-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            observer.observe(card);
        });

// ── Popular products from DB ──────────────────────────────────────────────────
async function loadPopularProducts() {
    const grid = document.getElementById('popularProducts');
    try {
        const res = await fetch('http://127.0.0.1:3000/products?limit=4');
        if (!res.ok) throw new Error();
        const products = await res.json();

        if (!products.length) {
            grid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1">Нет доступных товаров</p>';
            return;
        }

        grid.innerHTML = products.map(buildProductCard).join('');

        // animate cards
        grid.querySelectorAll('.product-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            observer.observe(card);
        });

        markWishlistButtons();
    } catch {
        grid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1">Не удалось загрузить товары</p>';
    }
}

loadPopularProducts();


// ── Auth header ───────────────────────────────────────────────────────────────
if (localStorage.getItem('token')) {
    // Залогинен — заменяем дропдаун простой ссылкой на аккаунт
    const wrapper = document.getElementById('accountDropdownWrapper');
    if (wrapper) {
        wrapper.outerHTML =
            '<a href="../account/account.html" class="hdr-icon-link" title="Мой аккаунт">' +
            '<i class="fas fa-user"></i></a>';
    }
} else {
    // Не залогинен — показываем дропдаун с формой входа
    const accountBtn    = document.getElementById('accountBtn');
    const loginDropdown = document.getElementById('loginDropdown');
    const registerLink  = document.getElementById('registerLink');
    let dropdownTimeout;

    accountBtn?.addEventListener('mouseenter', () => {
        clearTimeout(dropdownTimeout);
        loginDropdown?.classList.add('active');
    });
    loginDropdown?.addEventListener('mouseenter', () => clearTimeout(dropdownTimeout));
    accountBtn?.addEventListener('mouseleave', () => {
        dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
    });
    loginDropdown?.addEventListener('mouseleave', () => {
        if (loginDropdown.contains(document.activeElement)) return;
        dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
    });
    loginDropdown?.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => clearTimeout(dropdownTimeout));
        input.addEventListener('blur', () => {
            if (!loginDropdown.matches(':hover'))
                dropdownTimeout = setTimeout(() => loginDropdown?.classList.remove('active'), 300);
        });
    });
    document.getElementById('goToLoginPage')?.addEventListener('click', () => {
        window.location.href = '../login/login.html';
    });
    registerLink?.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '../registration/registration.html';
    });
}