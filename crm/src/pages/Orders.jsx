import { useState, useEffect } from 'react'
import './Orders.css'

const API = 'http://127.0.0.1:3000'

const COLUMNS = [
    { key: 'processing', label: 'В обработке', color: '#f59e0b', statuses: ['pending', 'processing'] },
    { key: 'shipped',    label: 'Доставляется', color: '#3b82f6', statuses: ['shipped'] },
    { key: 'delivered',  label: 'Доставлено',   color: '#10b981', statuses: ['delivered'] },
    { key: 'cancelled',  label: 'Отменён',      color: '#ef4444', statuses: ['cancelled'] },
]

const DROP_STATUS = { processing: 'processing', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' }

const STATUS_OPTIONS = [
    { value: 'pending',    label: 'Ожидает' },
    { value: 'processing', label: 'В обработке' },
    { value: 'shipped',    label: 'Доставляется' },
    { value: 'delivered',  label: 'Доставлено' },
    { value: 'cancelled',  label: 'Отменён' },
]

function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtSum(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽'
}

export default function Orders() {
    const [orders,   setOrders]   = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState(null)
    const [search,   setSearch]   = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo,   setDateTo]   = useState('')
    const [dragId,   setDragId]   = useState(null)
    const [dragOver, setDragOver] = useState(null)

    async function fetchOrders() {
        try {
            const r = await fetch(`${API}/orders`)
            if (!r.ok) throw new Error()
            setOrders(await r.json())
        } catch {
            setError('Не удалось загрузить заказы')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [])

    async function updateStatus(orderId, newStatus) {
        try {
            const res = await fetch(`${API}/orders/${orderId}/status`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ status: newStatus })
            })
            if (!res.ok) return
            // Перезагружаем список с сервера — гарантирует синхронизацию с БД
            await fetchOrders()
        } catch { /* ignore network errors */ }
    }

    // ── Drag & Drop ─────────────────────────────────────────────────────────────
    function onDragStart(e, orderId) {
        e.dataTransfer.setData('orderId', String(orderId))
        e.dataTransfer.effectAllowed = 'move'
        setDragId(orderId)
    }

    function onDragEnd() {
        setDragId(null)
        setDragOver(null)
    }

    function onDropZoneDragOver(e, colKey) {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        if (dragOver !== colKey) setDragOver(colKey)
    }

    function onDropZoneDrop(e, colKey) {
        e.preventDefault()
        e.stopPropagation()
        const orderId = Number(e.dataTransfer.getData('orderId'))
        if (orderId) updateStatus(orderId, DROP_STATUS[colKey])
        setDragId(null)
        setDragOver(null)
    }

    function onColDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOver(null)
        }
    }

    // ── Filter ──────────────────────────────────────────────────────────────────
    const filtered = orders.filter(o => {
        const name = `${o.users?.first_name ?? ''} ${o.users?.last_name ?? ''}`.toLowerCase()
        if (search && !name.includes(search.toLowerCase())) return false
        if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) return false
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59)
            if (new Date(o.created_at) > to) return false
        }
        return true
    })

    return (
        <>
            <header className="crm-header">
                <div>
                    <h1 className="crm-page-title">Заказы</h1>
                    <p className="crm-page-sub">
                        Перетащите карточку или выберите статус в списке
                    </p>
                </div>
            </header>

            <div className="crm-content">

                {/* Filters */}
                <div className="ord-filters">
                    <div className="ord-search-wrap">
                        <IconSearch />
                        <input
                            className="ord-search"
                            placeholder="Поиск по имени клиента..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="ord-date-wrap">
                        <input type="date" className="ord-date" value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)} title="Дата с" />
                        <span className="ord-date-sep">—</span>
                        <input type="date" className="ord-date" value={dateTo}
                            onChange={e => setDateTo(e.target.value)} title="Дата по" />
                    </div>
                    <span className="ord-count">{filtered.length} заказов</span>
                </div>

                {loading && <div className="ord-state"><div className="ord-spinner" /><p>Загрузка...</p></div>}
                {error   && <div className="ord-state ord-error"><IconErr /><p>{error}</p></div>}

                {!loading && !error && (
                    <div className="kanban-board">
                        {COLUMNS.map(col => {
                            const colOrders = filtered.filter(o => col.statuses.includes(o.status))
                            const isOver    = dragOver === col.key
                            return (
                                <div
                                    key={col.key}
                                    className={`kanban-col ${isOver ? 'kanban-col-over' : ''} ${col.key === 'cancelled' ? 'kanban-col-cancelled' : ''}`}
                                    onDragLeave={onColDragLeave}
                                >
                                    <div className="kanban-col-header">
                                        <span className="kanban-dot" style={{ background: col.color }} />
                                        <span className="kanban-col-title">{col.label}</span>
                                        <span className="kanban-col-count">{colOrders.length}</span>
                                    </div>

                                    {/* Зона дропа — именно здесь обрабатываем dragover/drop */}
                                    <div
                                        className="kanban-drop-zone"
                                        onDragOver={e => onDropZoneDragOver(e, col.key)}
                                        onDrop={e => onDropZoneDrop(e, col.key)}
                                    >
                                        {colOrders.length === 0 && (
                                            <div className="kanban-empty">
                                                {isOver ? 'Отпустите здесь' : 'Нет заказов'}
                                            </div>
                                        )}
                                        {colOrders.map(order => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                dragging={dragId === order.id}
                                                onDragStart={onDragStart}
                                                onDragEnd={onDragEnd}
                                                onStatusChange={updateStatus}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}

function OrderCard({ order, dragging, onDragStart, onDragEnd, onStatusChange }) {
    const u = order.users
    return (
        <div
            className={`ord-card ${dragging ? 'ord-card-dragging' : ''}`}
            draggable={true}
            onDragStart={e => onDragStart(e, order.id)}
            onDragEnd={onDragEnd}
        >
            <div className="ord-card-top">
                <span className="ord-card-id">#{order.id}</span>
                <span className="ord-card-date">{fmtDate(order.created_at)}</span>
            </div>

            {u && (
                <div className="ord-card-client">
                    <div className="ord-client-name">{u.first_name} {u.last_name}</div>
                    <div className="ord-client-email">{u.email}</div>
                    {u.phone && <div className="ord-client-phone">{u.phone}</div>}
                </div>
            )}

            {order.order_items?.length > 0 && (
                <div className="ord-card-items">
                    {order.order_items.map(item => (
                        <div key={item.id} className="ord-item-row">
                            <span className="ord-item-name">{item.product_name}</span>
                            <span className="ord-item-qty">×{item.quantity}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="ord-card-footer">
                <span className="ord-card-total">{fmtSum(order.total_amount)}</span>
                {/* Select — надёжная альтернатива drag & drop */}
                <select
                    className="ord-status-select"
                    value={order.status}
                    onChange={e => onStatusChange(order.id, e.target.value)}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

function IconSearch() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
