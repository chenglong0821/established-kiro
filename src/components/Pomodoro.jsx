import React, { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Pomodoro.css'

const SUBJECTS = [
  '职业能力倾向测验(D类)',
  '综合应用能力(D类)',
  '辅导员专业知识',
  '其他',
]

const WORK_MIN = 25
const BREAK_MIN = 5

export default function Pomodoro() {
  const [studyLog, setStudyLog] = useLocalStorage('studyLog', {})
  const [pomodoroHistory, setPomodoroHistory] = useLocalStorage('pomodoroHistory', [])
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [seconds, setSeconds] = useState(WORK_MIN * 60)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            handleTimerEnd()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, isBreak])

  const handleTimerEnd = () => {
    setRunning(false)
    if (!isBreak) {
      // 记录学习时长
      const todayKey = new Date().toISOString().slice(0, 10)
      setStudyLog(prev => ({
        ...prev,
        [todayKey]: (prev[todayKey] || 0) + WORK_MIN,
      }))
      setPomodoroHistory(prev => [
        ...prev,
        { date: todayKey, subject, minutes: WORK_MIN, time: new Date().toLocaleTimeString() },
      ])
      // 播放提示音
      try { new Audio('data:audio/wav;base64,UklGRl9vT19teleVBmZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU').play() } catch {}
      alert('🍅 专注结束！休息一下吧')
      setIsBreak(true)
      setSeconds(BREAK_MIN * 60)
    } else {
      alert('☕ 休息结束！继续加油')
      setIsBreak(false)
      setSeconds(WORK_MIN * 60)
    }
  }

  const toggle = () => setRunning(r => !r)

  const reset = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    setIsBreak(false)
    setSeconds(WORK_MIN * 60)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const progress = isBreak
    ? (1 - seconds / (BREAK_MIN * 60)) * 100
    : (1 - seconds / (WORK_MIN * 60)) * 100

  // 今日番茄数
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayPomodoros = pomodoroHistory.filter(p => p.date === todayKey)

  return (
    <div className="pomodoro">
      <div className="card pomodoro-main">
        <h2>{isBreak ? '☕ 休息时间' : '🍅 专注时间'}</h2>
        {!running && !isBreak && (
          <div className="subject-select">
            <label>学习科目：</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="timer-ring">
          <svg viewBox="0 0 120 120" className="ring-svg">
            <circle cx="60" cy="60" r="54" className="ring-bg" />
            <circle
              cx="60" cy="60" r="54"
              className="ring-progress"
              style={{
                strokeDasharray: `${2 * Math.PI * 54}`,
                strokeDashoffset: `${2 * Math.PI * 54 * (1 - progress / 100)}`,
                stroke: isBreak ? 'var(--success)' : 'var(--primary)',
              }}
            />
          </svg>
          <div className="timer-text">
            <span className="timer-digits">{mm}:{ss}</span>
            <span className="timer-label">{isBreak ? '休息中' : subject}</span>
          </div>
        </div>
        <div className="timer-controls">
          <button className={`ctrl-btn ${running ? 'pause' : 'start'}`} onClick={toggle}>
            {running ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button className="ctrl-btn reset" onClick={reset}>🔄 重置</button>
        </div>
      </div>

      <div className="card">
        <h2>📋 今日番茄记录 ({todayPomodoros.length} 个)</h2>
        {todayPomodoros.length === 0 ? (
          <p className="empty">还没有完成番茄，开始专注吧</p>
        ) : (
          <div className="pomo-list">
            {todayPomodoros.map((p, i) => (
              <div key={i} className="pomo-item">
                <span>🍅</span>
                <span>{p.subject}</span>
                <span className="pomo-time">{p.time}</span>
                <span className="pomo-min">{p.minutes}分钟</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
