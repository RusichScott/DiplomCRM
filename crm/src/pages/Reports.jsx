import { useState } from 'react'
import './Reports.css'

const API = 'http://localhost:3000'

const STATUS_LABELS = {
    pending:    'Ожидает',
    processing: 'В обработке',
    shipped:    'Доставляется',
    delivered:  'Доставлено',
    cancelled:  'Отменён',
}

const STATUS_COLORS = {
    pending:    '#f59e0b',
    processing: '#3b82f6',
    shipped:    '#8b5cf6',
    delivered:  '#10b981',
    cancelled:  '#ef4444',
}

function fmt(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽'
}

function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', {
        day: '2-digit', month: 'long', year: 'numeric'
    })
}

function today() {
    return new Date().toISOString().slice(0, 10)
}

function monthAgo() {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
}

const QUICK_RANGES = [
    { label: 'Сегодня',      from: () => today(),      to: () => today() },
    { label: 'Эта неделя',   from: () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0,10) }, to: () => today() },
    { label: 'Этот месяц',   from: () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10) }, to: () => today() },
    { label: 'Прошлый месяц',from: () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,10) },
                              to:   () => { const d = new Date(); d.setDate(0); return d.toISOString().slice(0,10) } },
    { label: 'Этот год',     from: () => new Date().getFullYear() + '-01-01', to: () => today() },
]

export default function Reports() {
    const [from,        setFrom]       = useState(monthAgo())
    const [to,          setTo]         = useState(today())
    const [loading,     setLoading]    = useState(false)
    const [report,      setReport]     = useState(null)
    const [error,       setError]      = useState(null)
    const [activeQuick, setActiveQuick] = useState(null)

    async function generate() {
        setLoading(true)
        setError(null)
        setReport(null)
        try {
            const r = await fetch(`${API}/orders/report?from=${from}&to=${to}`)
            if (!r.ok) throw new Error()
            setReport(await r.json())
        } catch {
            setError('Не удалось сформировать отчёт. Проверьте соединение с сервером.')
        } finally {
            setLoading(false)
        }
    }

    function applyQuick(range) {
        setFrom(range.from())
        setTo(range.to())
        setReport(null)
        setActiveQuick(range.label)
    }

    function onDateChange(setter) {
        return (e) => { setter(e.target.value); setReport(null); setActiveQuick(null) }
    }

    return (
        <>
            <header className="crm-header">
                <div>
                    <h1 className="crm-page-title">Отчёты</h1>
                    <p className="crm-page-sub">Формирование отчёта по заказам за выбранный период</p>
                </div>
                {report && (
                    <button className="rep-print-btn" onClick={() => window.print()}>
                        <IconPrint /> Печать / PDF
                    </button>
                )}
            </header>

            <div className="crm-content">

                {/* Controls */}
                <div className="rep-controls">
                    <div className="rep-quick-ranges">
                        {QUICK_RANGES.map(r => (
                            <button
                                key={r.label}
                                className={`rep-quick-btn${activeQuick === r.label ? ' rep-quick-btn--active' : ''}`}
                                onClick={() => applyQuick(r)}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <div className="rep-date-row">
                        <div className="rep-date-group">
                            <label>С</label>
                            <input type="date" value={from} max={to} onChange={onDateChange(setFrom)} />
                        </div>
                        <span className="rep-date-sep">—</span>
                        <div className="rep-date-group">
                            <label>По</label>
                            <input type="date" value={to} min={from} max={today()} onChange={onDateChange(setTo)} />
                        </div>
                        <button className="rep-generate-btn" onClick={generate} disabled={loading || !from || !to}>
                            {loading ? <><span className="rep-spinner" /> Загрузка...</> : <><IconReport /> Сформировать</>}
                        </button>
                    </div>
                </div>

                {error && <div className="rep-error"><IconWarn /> {error}</div>}

                {loading && (
                    <div className="rep-loading">
                        <div className="rep-spinner-lg" />
                        <p>Формируем отчёт...</p>
                    </div>
                )}

                {report && !loading && <ReportView report={report} />}
            </div>
        </>
    )
}

function ReportView({ report }) {
    const { summary, byStatus, byCategory, byProduct, period } = report

    const totalCatQty = byCategory.reduce((s, c) => s + c.qty, 0)

    return (
        <div className="rep-report" id="printable-report">

            {/* Report header */}
            <div className="rep-header-row">
                <div>
                    <h2 className="rep-title">Отчёт по заказам</h2>
                    <p className="rep-subtitle">
                        {fmtDate(period.from)} — {fmtDate(period.to)}
                    </p>
                </div>
                <div className="rep-generated">
                    Сформирован: {new Date().toLocaleString('ru-RU', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </div>
            </div>

            {/* Summary cards */}
            <div className="rep-summary">
                <div className="rep-card rep-card-total">
                    <p className="rep-card-label">Всего заказов</p>
                    <p className="rep-card-value">{summary.totalOrders}</p>
                    {summary.totalOrders !== summary.activeOrders && (
                        <p className="rep-card-note">{summary.activeOrders} активных</p>
                    )}
                </div>
                <div className="rep-card rep-card-revenue">
                    <p className="rep-card-label">Выручка (без отменённых)</p>
                    <p className="rep-card-value rep-card-value-lg">{fmt(summary.totalRevenue)}</p>
                </div>
                <div className="rep-card rep-card-avg">
                    <p className="rep-card-label">Средний чек</p>
                    <p className="rep-card-value">{summary.activeOrders > 0 ? fmt(summary.avgOrder) : '—'}</p>
                </div>
                <div className="rep-card rep-card-items">
                    <p className="rep-card-label">Изделий продано</p>
                    <p className="rep-card-value">{totalCatQty} шт.</p>
                </div>
            </div>

            {/* Status breakdown */}
            {byStatus.length > 0 && (
                <div className="rep-section">
                    <h3 className="rep-section-title">Заказы по статусам</h3>
                    <div className="rep-status-row">
                        {byStatus.map(s => (
                            <div key={s.status} className="rep-status-chip" style={{ '--chip-color': STATUS_COLORS[s.status] || '#888' }}>
                                <span className="rep-status-dot" />
                                <span className="rep-status-label">{STATUS_LABELS[s.status] || s.status}</span>
                                <span className="rep-status-count">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* By category */}
            <div className="rep-section">
                <h3 className="rep-section-title">По категориям</h3>
                {byCategory.length === 0 ? (
                    <p className="rep-no-data">Нет данных за выбранный период</p>
                ) : (
                    <div className="rep-table-wrap">
                        <table className="rep-table">
                            <thead>
                                <tr>
                                    <th>Категория</th>
                                    <th className="rep-num">Кол-во изделий</th>
                                    <th className="rep-num">Доля</th>
                                    <th className="rep-num">Выручка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {byCategory.map(cat => (
                                    <tr key={cat.name}>
                                        <td className="rep-cat-name">{cat.name}</td>
                                        <td className="rep-num">
                                            <span className="rep-qty-badge">{cat.qty} шт.</span>
                                        </td>
                                        <td className="rep-num rep-pct">
                                            {totalCatQty > 0 ? ((cat.qty / totalCatQty) * 100).toFixed(1) : 0}%
                                            <div className="rep-bar-wrap">
                                                <div
                                                    className="rep-bar"
                                                    style={{ width: totalCatQty > 0 ? `${(cat.qty / totalCatQty) * 100}%` : '0%' }}
                                                />
                                            </div>
                                        </td>
                                        <td className="rep-num rep-revenue">{fmt(cat.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="rep-tfoot">
                                    <td>Итого</td>
                                    <td className="rep-num">{totalCatQty} шт.</td>
                                    <td className="rep-num">100%</td>
                                    <td className="rep-num rep-revenue">
                                        {fmt(byCategory.reduce((s, c) => s + c.revenue, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* By product */}
            <div className="rep-section">
                <h3 className="rep-section-title">По наименованиям</h3>
                {byProduct.length === 0 ? (
                    <p className="rep-no-data">Нет данных за выбранный период</p>
                ) : (
                    <div className="rep-table-wrap">
                        <table className="rep-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Наименование</th>
                                    <th>Категория</th>
                                    <th className="rep-num">Кол-во</th>
                                    <th className="rep-num">Выручка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {byProduct.map((p, i) => (
                                    <tr key={p.product_name + i}>
                                        <td className="rep-row-num">{i + 1}</td>
                                        <td className="rep-product-name">{p.product_name}</td>
                                        <td className="rep-product-cat">
                                            <span className="rep-cat-badge">{p.category_name}</span>
                                        </td>
                                        <td className="rep-num">
                                            <span className="rep-qty-badge">{p.qty} шт.</span>
                                        </td>
                                        <td className="rep-num rep-revenue">{fmt(p.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="rep-tfoot">
                                    <td></td>
                                    <td colSpan={2}>Итого</td>
                                    <td className="rep-num">{byProduct.reduce((s, p) => s + p.qty, 0)} шт.</td>
                                    <td className="rep-num rep-revenue">
                                        {fmt(byProduct.reduce((s, p) => s + p.revenue, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function IconPrint() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
        </svg>
    )
}

function IconReport() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
    )
}

function IconWarn() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    )
}
