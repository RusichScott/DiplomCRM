import { useState, useEffect } from 'react'
import './Customers.css'

const API = 'http://127.0.0.1:3000'

const STATUS_LABELS = {
    pending:    'Ожидает',
    processing: 'В обработке',
    shipped:    'Отправлен',
    delivered:  'Доставлен',
    cancelled:  'Отменён'
}

const STATUS_COLORS = {
    pending:    '#f59e0b',
    processing: '#7c3aed',
    shipped:    '#3b82f6',
    delivered:  '#10b981',
    cancelled:  '#ef4444'
}

function initials(first, last) {
    return (first?.[0] ?? '').toUpperCase() + (last?.[0] ?? '').toUpperCase()
}

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day:   '2-digit',
        month: 'short',
        year:  'numeric'
    })
}

function fmtSum(n) {
    return n.toLocaleString('ru-RU') + ' ₽'
}

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState(null)
    const [search,    setSearch]    = useState('')

    useEffect(() => {
        fetch(`${API}/customers`)
            .then(r => {
                if (!r.ok) throw new Error(r.status)
                return r.json()
            })
            .then(data => setCustomers(data))
            .catch(() => setError('Не удалось загрузить список клиентов'))
            .finally(() => setLoading(false))
    }, [])

    const filtered = customers.filter(c => {
        const q = search.toLowerCase()
        return (
            c.first_name.toLowerCase().includes(q) ||
            c.last_name.toLowerCase().includes(q)  ||
            c.email.toLowerCase().includes(q)      ||
            (c.phone ?? '').includes(q)
        )
    })

    return (
        <>
            <header className="crm-header">
                <div>
                    <h1 className="crm-page-title">Клиенты</h1>
                    <p className="crm-page-sub">База покупателей магазина Miestilo</p>
                </div>
            </header>

            <div className="crm-content">

                <div className="cust-toolbar">
                    <div className="cust-search-wrap">
                        <IconSearch />
                        <input
                            className="cust-search"
                            placeholder="Поиск по имени, email, телефону..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {!loading && !error && (
                        <span className="cust-count">{filtered.length} клиентов</span>
                    )}
                </div>

                {loading && (
                    <div className="cust-state">
                        <div className="cust-spinner" />
                        <p>Загрузка...</p>
                    </div>
                )}

                {error && (
                    <div className="cust-state cust-error">
                        <IconError />
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="cust-table-wrap">
                        <table className="cust-table">
                            <thead>
                                <tr>
                                    <th>Клиент</th>
                                    <th>Email</th>
                                    <th>Телефон</th>
                                    <th>Заказов</th>
                                    <th>Потрачено</th>
                                    <th>Последний заказ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="cust-no-results">
                                            Клиенты не найдены
                                        </td>
                                    </tr>
                                ) : filtered.map(c => (
                                    <tr key={c.id} className="cust-row">
                                        <td>
                                            <div className="cust-cell">
                                                <div className="cust-avatar">
                                                    {initials(c.first_name, c.last_name)}
                                                </div>
                                                <div>
                                                    <div className="cust-name">
                                                        {c.first_name} {c.last_name}
                                                    </div>
                                                    <div className="cust-since">
                                                        с {fmtDate(c.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="cust-email">{c.email}</td>
                                        <td className="cust-phone">{c.phone ?? '—'}</td>
                                        <td>
                                            {c.order_count > 0
                                                ? <span className="cust-orders-badge">{c.order_count}</span>
                                                : <span className="cust-muted">0</span>
                                            }
                                        </td>
                                        <td className="cust-sum">
                                            {c.total_spent > 0 ? fmtSum(c.total_spent) : <span className="cust-muted">—</span>}
                                        </td>
                                        <td>
                                            {c.last_order ? (
                                                <div className="cust-last-order">
                                                    <span
                                                        className="cust-status-dot"
                                                        style={{ background: STATUS_COLORS[c.last_order.status] }}
                                                    />
                                                    <div>
                                                        <div className="cust-status-label">
                                                            {STATUS_LABELS[c.last_order.status]}
                                                        </div>
                                                        <div className="cust-last-date">
                                                            {fmtDate(c.last_order.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="cust-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
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

function IconError() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    )
}
