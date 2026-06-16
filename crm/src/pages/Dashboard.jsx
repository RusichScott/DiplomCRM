import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Customers    from './Customers'
import Orders       from './Orders'
import Products     from './Products'
import OrderHistory from './OrderHistory'
import './Dashboard.css'

const API = 'https://diplomcrm-production.up.railway.app'

const PERIODS = [
  { key: 'day',   label: 'День' },
  { key: 'week',  label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year',  label: 'Год' },
]

const COLORS = ['#7c3aed', '#a855f7', '#c026d3', '#db2777', '#f472b6', '#f59e0b']

const NAV = [
  { label: 'Дашборд',  icon: <IconDashboard /> },
  { label: 'Заказы',   icon: <IconOrders /> },
  { label: 'Клиенты',  icon: <IconCustomers /> },
  { label: 'Товары',   icon: <IconProducts /> },
  { label: 'История',  icon: <IconHistory /> },
]

const fmt = (n) => Number(n).toLocaleString('ru-RU') + ' ₽'

function CustomTooltip({ active, payload, totalQty }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const raw = totalQty > 0 ? (d.qty / totalQty) * 100 : 0
  const pct = Number.isFinite(raw) ? raw.toFixed(1) : '0.0'
  return (
    <div className="pie-tooltip">
      <span className="pie-tt-name">{d.name}</span>
      <span className="pie-tt-row">
        <span className="pie-tt-label">Кол-во</span>
        <span className="pie-tt-val">{d.qty} шт.</span>
      </span>
      <span className="pie-tt-row">
        <span className="pie-tt-label">Доля</span>
        <span className="pie-tt-val">{pct}%</span>
      </span>
    </div>
  )
}

export default function Dashboard({ onLogout }) {
  const [period,      setPeriod]     = useState('month')
  const [activeNav,   setActiveNav]  = useState(0)
  const [analytics,   setAnalytics]  = useState(null)
  const [anaLoading,  setAnaLoading] = useState(true)
  const [chartReady,  setChartReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navClick(i) {
    setActiveNav(i)
    setSidebarOpen(false)
  }

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setAnaLoading(true)
    fetch(`${API}/orders/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setAnalytics(data); setAnaLoading(false) })
      .catch(() => setAnaLoading(false))
  }, [period])

  const chartData = (analytics?.topProducts ?? []).map((p, i) => ({
    ...p,
    qty:   Number(p.qty) || 0,
    color: COLORS[i % COLORS.length],
  }))

  const totalQty = chartData.reduce((s, d) => s + d.qty, 0)

  return (
    <div className="crm-layout">

      {/* Mobile top bar */}
      <div className="crm-mobile-bar">
        <button className="crm-hamburger" onClick={() => setSidebarOpen(s => !s)}>
          <IconHamburger open={sidebarOpen} />
        </button>
        <span className="crm-mobile-logo">Miestilo CRM</span>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-name">Miestilo</span>
          <span className="sidebar-logo-sub">CRM</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item, i) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === i ? 'active' : ''}`}
              onClick={() => navClick(i)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={onLogout}>
          <IconLogout />
          <span>Выйти</span>
        </button>
      </aside>

      {/* Main */}
      <main className="crm-main">

        {activeNav === 1 ? <Orders /> : activeNav === 2 ? <Customers /> : activeNav === 3 ? <Products /> : activeNav === 4 ? <OrderHistory /> : (
        <>
        <header className="crm-header">
          <div>
            <h1 className="crm-page-title">Аналитика продаж</h1>
            <p className="crm-page-sub">Статистика заказов за выбранный период</p>
          </div>
        </header>

        <div className="crm-content">

          {/* Period tabs */}
          <div className="period-tabs">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`period-tab ${period === p.key ? 'active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {anaLoading ? (
            <div className="ana-loading">Загрузка...</div>
          ) : (
          <div className="analytics-grid">

            {/* Pie chart */}
            <div className="chart-card">
              <p className="chart-card-title">Категории по количеству</p>

              {chartData.length === 0 ? (
                <div className="ana-empty">Нет заказов за этот период</div>
              ) : chartReady ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={130}
                      paddingAngle={3}
                      dataKey="qty"
                    >
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip totalQty={totalQty} />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              {/* Legend */}
              <div className="pie-legend">
                {chartData.map(d => {
                  const raw = totalQty > 0 ? (d.qty / totalQty) * 100 : 0
                  const pct = Number.isFinite(raw) ? raw.toFixed(1) : '0.0'
                  return (
                    <div key={d.name} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="legend-name">{d.name}</span>
                      <span className="legend-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right stats */}
            <div className="stats-col">

              <div className="total-card">
                <p className="total-card-label">Выручка за период</p>
                <p className="total-card-sum">{fmt(analytics?.totalRevenue ?? 0)}</p>
                <p className="total-card-qty">
                  {analytics?.totalOrders ?? 0} заказов
                  {analytics?.avgOrder > 0 && ` · ср. чек ${fmt(analytics.avgOrder)}`}
                </p>
              </div>

              <div className="breakdown-card">
                <p className="breakdown-title">По товарам</p>
                {chartData.length === 0 ? (
                  <p className="ana-no-data">Нет данных</p>
                ) : (
                  chartData.map((d, i) => (
                    <div key={d.name} className="breakdown-row">
                      <span className="breakdown-dot" style={{ background: COLORS[i] }} />
                      <span className="breakdown-name">{d.name}</span>
                      <span className="breakdown-sum">{fmt(d.revenue)}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
          )}
        </div>
        </>
        )}
      </main>
    </div>
  )
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
function IconOrders() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}
function IconCustomers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
function IconProducts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}
function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IconHamburger({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}
function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
