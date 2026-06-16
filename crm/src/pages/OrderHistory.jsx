import { useState, useEffect, Fragment } from 'react'
import './OrderHistory.css'

const API = 'http://127.0.0.1:3000'

const STATUS_LABELS = {
    pending:    'Ожидает',
    processing: 'В обработке',
    shipped:    'Доставляется',
    delivered:  'Доставлено',
    cancelled:  'Отменён'
}

const STATUS_COLORS = {
    pending:    '#f59e0b',
    processing: '#7c3aed',
    shipped:    '#3b82f6',
    delivered:  '#10b981',
    cancelled:  '#ef4444'
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('ru-RU', {
        hour: '2-digit', minute: '2-digit'
    })
}

function fmtSum(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽'
}

export default function OrderHistory() {
    const [orders,       setOrders]       = useState([])
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState(null)
    const [search,       setSearch]       = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [dateFrom,     setDateFrom]     = useState('')
    const [dateTo,       setDateTo]       = useState('')
    const [expandedId,   setExpandedId]   = useState(null)

    useEffect(() => {
        fetch(`${API}/orders`)
            .then(r => { if (!r.ok) throw new Error(); return r.json() })
            .then(setOrders)
            .catch(() => setError('Не удалось загрузить историю заказов'))
            .finally(() => setLoading(false))
    }, [])

    const filtered = orders.filter(o => {
        const name = `${o.users?.first_name ?? ''} ${o.users?.last_name ?? ''}`.toLowerCase()
        const q = search.toLowerCase()
        if (search && !name.includes(q) && !String(o.id).includes(q)) return false
        if (statusFilter && o.status !== statusFilter) return false
        if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) return false
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59)
            if (new Date(o.created_at) > to) return false
        }
        return true
    })

    function toggleExpand(id) {
        setExpandedId(prev => prev === id ? null : id)
    }

    return (
        <>
            <header className="crm-header">
                <div>
                    <h1 className="crm-page-title">История заказов</h1>
                    <p className="crm-page-sub">Все заказы магазина Miestilo</p>
                </div>
            </header>

            <div className="crm-content">

                <div className="oh-toolbar">
                    <div className="oh-search-wrap">
                        <IconSearch />
                        <input
                            className="oh-search"
                            placeholder="Поиск по клиенту или № заказа..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="oh-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">Все статусы</option>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>

                    <div className="oh-date-wrap">
                        <input type="date" className="oh-date" value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)} title="Дата с" />
                        <span className="oh-date-sep">—</span>
                        <input type="date" className="oh-date" value={dateTo}
                            onChange={e => setDateTo(e.target.value)} title="Дата по" />
                    </div>

                    {!loading && !error && (
                        <span className="oh-count">{filtered.length} заказов</span>
                    )}
                </div>

                {loading && (
                    <div className="oh-state">
                        <div className="oh-spinner" />
                        <p>Загрузка...</p>
                    </div>
                )}

                {error && (
                    <div className="oh-state oh-error">
                        <IconErr />
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="oh-table-wrap">
                        <table className="oh-table">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Клиент</th>
                                    <th>Дата и время</th>
                                    <th>Статус</th>
                                    <th>Сумма</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="oh-no-results">
                                            Заказы не найдены
                                        </td>
                                    </tr>
                                ) : filtered.map(o => {
                                    const isOpen = expandedId === o.id
                                    const u = o.users
                                    return (
                                        <Fragment key={o.id}>
                                            <tr
                                                className={`oh-row ${isOpen ? 'oh-row-open' : ''}`}
                                                onClick={() => toggleExpand(o.id)}
                                            >
                                                <td className="oh-id">#{o.id}</td>
                                                <td>
                                                    {u ? (
                                                        <div className="oh-client">
                                                            <span className="oh-client-name">
                                                                {u.first_name} {u.last_name}
                                                            </span>
                                                            <span className="oh-client-email">{u.email}</span>
                                                        </div>
                                                    ) : <span className="oh-muted">—</span>}
                                                </td>
                                                <td>
                                                    <div className="oh-date-cell">
                                                        <span>{fmtDate(o.created_at)}</span>
                                                        <span className="oh-time">{fmtTime(o.created_at)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className="oh-status"
                                                        style={{
                                                            background: STATUS_COLORS[o.status] + '22',
                                                            color:      STATUS_COLORS[o.status]
                                                        }}
                                                    >
                                                        {STATUS_LABELS[o.status]}
                                                    </span>
                                                </td>
                                                <td className="oh-total">{fmtSum(o.total_amount)}</td>
                                                <td>
                                                    <span className={`oh-chevron ${isOpen ? 'oh-chevron-open' : ''}`}>
                                                        <IconChevron />
                                                    </span>
                                                </td>
                                            </tr>

                                            {isOpen && (
                                                <tr className="oh-detail-row">
                                                    <td colSpan="6">
                                                        <div className="oh-detail">

                                                            <div className="oh-items">
                                                                <p className="oh-section-title">Состав заказа</p>
                                                                {(o.order_items ?? []).length === 0 ? (
                                                                    <p className="oh-muted">Нет данных</p>
                                                                ) : (o.order_items).map(item => (
                                                                    <div key={item.id} className="oh-item-row">
                                                                        <span className="oh-item-name">{item.product_name}</span>
                                                                        <span className="oh-item-qty">×{item.quantity}</span>
                                                                        <span className="oh-item-price">
                                                                            {fmtSum(Number(item.price) * item.quantity)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {(o.delivery_method || o.payment_method || o.comment) && (
                                                                <div className="oh-meta">
                                                                    <p className="oh-section-title">Детали</p>
                                                                    {o.delivery_method && (
                                                                        <div className="oh-meta-row">
                                                                            <span className="oh-meta-label">Доставка</span>
                                                                            <span className="oh-meta-val">{o.delivery_method}</span>
                                                                        </div>
                                                                    )}
                                                                    {o.payment_method && (
                                                                        <div className="oh-meta-row">
                                                                            <span className="oh-meta-label">Оплата</span>
                                                                            <span className="oh-meta-val">{o.payment_method}</span>
                                                                        </div>
                                                                    )}
                                                                    {o.comment && (
                                                                        <div className="oh-meta-row">
                                                                            <span className="oh-meta-label">Комментарий</span>
                                                                            <span className="oh-meta-val">{o.comment}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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
function IconChevron() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
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
