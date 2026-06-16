const slug = new URLSearchParams(location.search).get('slug') || '';

async function loadCatalog() {
    const url = slug ? `${API}/products?category=${slug}` : `${API}/products`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status);
        const products = await res.json();

        // Set page title and breadcrumb from first product's category
        const categoryName = products[0]?.categories?.name
            || document.getElementById('breadcrumbCategory').textContent;

        if (products[0]?.categories?.name) {
            const name = products[0].categories.name;
            document.getElementById('breadcrumbCategory').textContent = name;
            document.getElementById('catalogTitle').textContent        = name;
            document.getElementById('pageTitle').textContent           = `${name} — Miestilo`;
            document.title                                              = `${name} — Miestilo`;
        }

        document.getElementById('catalogLoading').style.display = 'none';

        if (products.length === 0) {
            document.getElementById('catalogError').style.display    = 'flex';
            document.getElementById('catalogErrorText').textContent  = 'В этой категории пока нет товаров';
            return;
        }

        const grid = document.getElementById('catalogProducts');
        grid.innerHTML = products.map(buildProductCard).join('');
        grid.style.display = '';

        document.getElementById('catalogCount').textContent = `${products.length} товаров`;
        document.getElementById('catalogToolbar').style.display = '';

        // Mark wishlist buttons for logged-in users
        markWishlistButtons();

    } catch {
        document.getElementById('catalogLoading').style.display  = 'none';
        document.getElementById('catalogError').style.display    = 'flex';
        document.getElementById('catalogErrorText').textContent  = 'Не удалось загрузить товары. Проверьте подключение к серверу.';
    }
}

loadCatalog();
