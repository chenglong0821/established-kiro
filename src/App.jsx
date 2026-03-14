import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import Pomodoro from './components/Pomodoro'
import WrongBook from './components/WrongBook'
import Notes from './components/Notes'
import Stats from './components/Stats'
import './App.css'

const TABS = [
  { key: 'dashboard', label: '📊 仪表盘' },
  { key: 'practice', label: '✏️ 刷题' },
  { key: 'pomodoro', label: '🍅 番茄钟' },
  { key: 'wrong', label: '📝 错题本' },
  { key: 'notes', label: '📒 笔记' },
  { key: 'stats', label: '📈 统计' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 事业编学习助手</h1>
        <p className="subtitle">高校辅导员岗位备考</p>
      </header>
      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="main-content">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'practice' && <Practice />}
        {tab === 'pomodoro' && <Pomodoro />}
        {tab === 'wrong' && <WrongBook />}
        {tab === 'notes' && <Notes />}
        {tab === 'stats' && <Stats />}
      </main>
    </div>
  )
}
