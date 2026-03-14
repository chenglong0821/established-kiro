import React from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Dashboard.css'

const EXAM_DATE = new Date('2026-03-14')

function getCountdown() {
  const now = new Date()
  const diff = EXAM_DATE - now
  if (diff <= 0) return { days: 0, hours: 0, label: '考试时间已到，加油！' }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { days, hours, label: null }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const [checkins, setCheckins] = useLocalStorage('checkins', {})
  const [studyLog, setStudyLog] = useLocalStorage('studyLog', {})
  const countdown = getCountdown()
  const todayKey = getTodayKey()
  const checkedToday = !!checkins[todayKey]

  // 计算连续打卡天数
  let streak = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (checkins[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }

  // 今日学习时长（分钟）
  const todayMinutes = studyLog[todayKey] || 0

  const handleCheckin = () => {
    setCheckins({ ...checkins, [todayKey]: true })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="card countdown-card">
          <h2>⏰ 考试倒计时</h2>
          {countdown.label ? (
            <p className="countdown-text">{countdown.label}</p>
          ) : (
            <div className="countdown-numbers">
              <span className="big-num">{countdown.days}</span>
              <span className="unit">天</span>
              <span className="big-num">{countdown.hours}</span>
              <span className="unit">小时</span>
            </div>
          )}
          <p className="exam-date">考试日期：2026年3月14日</p>
        </div>

        <div className="card checkin-card">
          <h2>✅ 每日打卡</h2>
          {checkedToday ? (
            <div className="checked">
              <span className="check-icon">🎉</span>
              <p>今日已打卡</p>
            </div>
          ) : (
            <button className="checkin-btn" onClick={handleCheckin}>
              点击打卡
            </button>
          )}
          <p className="streak">连续打卡 <span>{streak}</span> 天</p>
        </div>

        <div className="card today-card">
          <h2>📖 今日学习</h2>
          <div className="today-minutes">
            <span className="big-num">{todayMinutes}</span>
            <span className="unit">分钟</span>
          </div>
          <p className="tip">使用番茄钟自动记录学习时长</p>
        </div>
      </div>

      <div className="card subjects-card">
        <h2>📋 考试科目</h2>
        <div className="subjects">
          <div className="subject-item">
            <span className="subject-icon">📐</span>
            <div>
              <h3>职业能力倾向测验(D类)</h3>
              <p>常识判断、言语理解、数量关系、判断推理、策略选择</p>
            </div>
          </div>
          <div className="subject-item">
            <span className="subject-icon">📝</span>
            <div>
              <h3>综合应用能力(D类)</h3>
              <p>教育方案设计、案例分析、教育活动方案策划</p>
            </div>
          </div>
          <div className="subject-item">
            <span className="subject-icon">🎓</span>
            <div>
              <h3>辅导员专业知识</h3>
              <p>思政教育、学生管理、心理健康、就业指导、党团建设</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
