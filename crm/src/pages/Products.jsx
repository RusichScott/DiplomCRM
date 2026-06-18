import { useState, useEffect } from 'react'
import './Products.css'

const API = 'http://localhost:3000'

const EMPTY_FORM = {
    name: '', category_id: '', sku: '', price: '',
    old_price: '', stock: '0', description: '', is_new: false, is_active: true
}

function fmtPrice(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽'
}

export default function Products() {
    const [products,   setProducts]   = useState([])
    const [categories, setCategories] = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState(null)
    const [search,     setSearch]     = useState('')
    const [catFilter,  setCatFilter]  = useState('')
    const [modal,      setModal]      = useState(null) // null | { mode: 'add'|'edit', product? }
    const [form,       setForm]       = useState(EMPTY_FORM)
    const [saving,     setSaving]     = useState(false)

    async function fetchProducts() {
        try {
            const r = await fetch(`${API}/products/crm`)
            if (!r.ok) throw new Error()
            setProducts(await r.json())
        } catch {
            setError('Не удалось загрузить товары')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
        fetch(`${API}/products/categories`)
            .then(r => r.ok ? r.json() : [])
            .then(setCategories)
            .catch(() => {})
    }, [])

    const filtered = products.filter(p => {
        if (catFilter && p.category_id !== Number(catFilter)) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    function openAdd() {
        setForm(EMPTY_FORM)
        setModal({ mode: 'add' })
    }

    function openEdit(product) {
        setForm({
            name:        product.name,
            category_id: String(product.category_id),
            sku:         product.sku,
            price:       String(Number(product.price)),
            old_price:   product.old_price ? String(Number(product.old_price)) : '',
            stock:       String(product.stock),
            description: product.description || '',
            is_new:      product.is_new,
            is_active:   product.is_active
        })
        setModal({ mode: 'edit', product })
    }

    function setField(key, value) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        const body = {
            name:        form.name.trim(),
            category_id: Number(form.category_id),
            sku:         form.sku.trim(),
            price:       Number(form.price),
            old_price:   form.old_price !== '' ? Number(form.old_price) : null,
            stock:       Number(form.stock),
            description: form.description.trim() || null,
            is_new:      form.is_new,
            is_active:   form.is_active
        }
        try {
            const url    = modal.mode === 'add'
                ? `${API}/products`
                : `${API}/products/${modal.product.id}`
            const method = modal.mode === 'add' ? 'POST' : 'PATCH'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                alert(err.error || 'Ошибка сохранения')
                return
            }
            setModal(null)
            await fetchProducts()
        } catch {
            alert('Ошибка сети')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(product) {
        if (!window.confirm(`Удалить "${product.name}"?`)) return
        try {
            const res = await fetch(`${API}/products/${product.id}`, { method: 'DELETE' })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                alert(err.error || 'Ошибка удаления')
                return
            }
            await fetchProducts()
        } catch {
            alert('Ошибка сети')
        }
    }

    return (
        <>
            <header className="crm-header">
                <div>
                    <h1 className="crm-page-title">Товары</h1>
                    <p className="crm-page-sub">Управление каталогом магазина Miestilo</p>
                </div>
            </header>

            <div className="crm-content">

                <div className="prod-toolbar">
                    <div className="prod-search-wrap">
                        <IconSearch />
                        <input
                            className="prod-search"
                            placeholder="Поиск по названию..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="prod-cat-filter"
                        value={catFilter}
                        onChange={e => setCatFilter(e.target.value)}
                    >
                        <option value="">Все категории</option>
                        {categories.map(c => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                    </select>

                    {!loading && !error && (
                        <span className="prod-count">{filtered.length} товаров</span>
                    )}

                    <button className="prod-add-btn" onClick={openAdd}>
                        <IconPlus />
                        <span className="prod-add-label">Добавить</span>
                    </button>
                </div>

                {loading && (
                    <div className="prod-state">
                        <div className="prod-spinner" />
                        <p>Загрузка...</p>
                    </div>
                )}

                {error && (
                    <div className="prod-state prod-error">
                        <IconErr />
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="prod-table-wrap">
                        <table className="prod-table">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Категория</th>
                                    <th>Артикул</th>
                                    <th>Цена</th>
                                    <th>Остаток</th>
                                    <th>Статус</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="prod-no-results">
                                            Товары не найдены
                                        </td>
                                    </tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id} className={`prod-row ${!p.is_active ? 'prod-row-inactive' : ''}`}>
                                        <td>
                                            <div className="prod-name-cell">
                                                <span className="prod-name">{p.name}</span>
                                                {p.is_new && <span className="prod-badge-new">NEW</span>}
                                            </div>
                                        </td>
                                        <td className="prod-cat">{p.categories?.name ?? '—'}</td>
                                        <td className="prod-sku">{p.sku}</td>
                                        <td>
                                            <div className="prod-price-cell">
                                                <span className="prod-price">{fmtPrice(p.price)}</span>
                                                {p.old_price && (
                                                    <span className="prod-old-price">{fmtPrice(p.old_price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={p.stock === 0 ? 'prod-stock-zero' : ''}>
                                                {p.stock} шт.
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`prod-status ${p.is_active ? 'prod-status-active' : 'prod-status-inactive'}`}>
                                                {p.is_active ? 'Активен' : 'Скрыт'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="prod-actions">
                                                <button
                                                    className="prod-action-btn prod-edit-btn"
                                                    onClick={() => openEdit(p)}
                                                    title="Редактировать"
                                                >
                                                    <IconEdit />
                                                </button>
                                                <button
                                                    className="prod-action-btn prod-del-btn"
                                                    onClick={() => handleDelete(p)}
                                                    title="Удалить"
                                                >
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div
                    className="prod-modal-overlay"
                    onClick={e => { if (e.target === e.currentTarget) setModal(null) }}
                >
                    <div className="prod-modal">
                        <div className="prod-modal-header">
                            <h2 className="prod-modal-title">
                                {modal.mode === 'add' ? 'Новый товар' : 'Редактировать товар'}
                            </h2>
                            <button className="prod-modal-close" onClick={() => setModal(null)}>
                                <IconX />
                            </button>
                        </div>

                        <form className="prod-form" onSubmit={handleSubmit}>

                            <div className="prod-field">
                                <label>Название *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setField('name', e.target.value)}
                                    placeholder="Серебряное кольцо EROS..."
                                />
                            </div>

                            <div className="prod-form-row">
                                <div className="prod-field">
                                    <label>Категория *</label>
                                    <select
                                        required
                                        value={form.category_id}
                                        onChange={e => setField('category_id', e.target.value)}
                                    >
                                        <option value="">Выберите...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="prod-field">
                                    <label>Артикул *</label>
                                    <input
                                        required
                                        value={form.sku}
                                        onChange={e => setField('sku', e.target.value)}
                                        placeholder="RNG-006"
                                    />
                                </div>
                            </div>

                            <div className="prod-form-row">
                                <div className="prod-field">
                                    <label>Цена (₽) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setField('price', e.target.value)}
                                        placeholder="14299"
                                    />
                                </div>

                                <div className="prod-field">
                                    <label>Старая цена (₽)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.old_price}
                                        onChange={e => setField('old_price', e.target.value)}
                                        placeholder="—"
                                    />
                                </div>
                            </div>

                            <div className="prod-form-row">
                                <div className="prod-field">
                                    <label>Остаток (шт.)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={e => setField('stock', e.target.value)}
                                    />
                                </div>

                                <div className="prod-field prod-field-checks">
                                    <label className="prod-check">
                                        <input
                                            type="checkbox"
                                            checked={form.is_new}
                                            onChange={e => setField('is_new', e.target.checked)}
                                        />
                                        Новинка
                                    </label>
                                    <label className="prod-check">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={e => setField('is_active', e.target.checked)}
                                        />
                                        Активен (виден на сайте)
                                    </label>
                                </div>
                            </div>

                            <div className="prod-field">
                                <label>Описание</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setField('description', e.target.value)}
                                    placeholder="Описание товара..."
                                />
                            </div>

                            <div className="prod-form-actions">
                                <button
                                    type="button"
                                    className="prod-cancel-btn"
                                    onClick={() => setModal(null)}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="prod-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

function IconSearch() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    )
}
function IconPlus() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    )
}
function IconEdit() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    )
}
function IconTrash() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
    )
}
function IconX() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    )
}
function IconErr() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    )
}
