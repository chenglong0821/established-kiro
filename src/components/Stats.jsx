import React from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Stats.css'

export default function Stats() {
  const [studyLog] = useLocalStorage('studyLog', {})
  const [pomodoroHistory] = useLocalStorage('pomodoroHistory', [])
  const [wrongQuestions] = useLocalStorage('wrongQuestions', [])
  const [checkins] = useLocalStorage('checkins', {})

  // 总学习时长
  const totalMinutes = Object.values(studyLog).reduce((a, b) => a + b, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  // 总打卡天数
  const totalCheckins = Object.keys(checkins).length

  // 总番茄数
  const totalPomodoros = pomodoroHistory.length

  // 各科番茄分布
  const subjectMap = {}
  pomodoroHistory.forEach(p => {
    subjectMap[p.subject] = (subjectMap[p.subject] || 0) + 1
  })

  // 错题掌握情况
  const masteryCount = [0, 0, 0]
  wrongQuestions.forEach(q => masteryCount[q.mastery]++)

  // 最近7天学习时长
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    last7Days.push({ date: key.slice(5), minutes: studyLog[key] || 0 })
  }
  const maxMin = Math.max(...last7Days.map(d => d.minutes), 1)

  return (
    <div className="stats">
      <div className="stats-overview">
        <div className="card stat-card">
          <span className="stat-icon">⏱</span>
          <span className="stat-num">{totalHours}</span>
          <span className="stat-label">总学习(小时)</span>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🍅</span>
          <span className="stat-num">{totalPomodoros}</span>
          <span className="stat-label">总番茄数</span>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-num">{totalCheckins}</span>
          <span className="stat-label">打卡天数</span>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-num">{wrongQuestions.length}</span>
          <span className="stat-label">错题总数</span>
        </div>
      </div>

      <div className="card">
        <h2>📊 最近7天学习时长</h2>
        <div className="bar-chart">
          {last7Days.map((d, i) => (
            <div key={i} className="bar-col">
              <div className="bar-value">{d.minutes}分</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(d.minutes / maxMin) * 100}%` }}
                />
              </div>
              <div className="bar-label">{d.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-row">
        <div className="card">
          <h2>🍅 各科番茄分布</h2>
          {Object.keys(subjectMap).length === 0 ? (
            <p className="empty">暂无数据</p>
          ) : (
            <div className="subject-bars">
              {Object.entries(subjectMap).map(([subject, count]) => (
                <div key={subject} className="subject-bar-row">
                  <span className="sb-label">{subject}</span>
                  <div className="sb-track">
                    <div
                      className="sb-fill"
                      style={{ width: `${(count / totalPomodoros) * 100}%` }}
                    />
                  </div>
                  <span className="sb-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>📝 错题掌握情况</h2>
          {wrongQuestions.length === 0 ? (
            <p className="empty">暂无错题</p>
          ) : (
            <div className="mastery-stats">
              <div className="mastery-row">
                <span className="mastery-dot danger" />
                <span>未掌握</span>
                <span className="mastery-num">{masteryCount[0]}</span>
              </div>
              <div className="mastery-row">
                <span className="mastery-dot warning" />
                <span>半掌握</span>
                <span className="mastery-num">{masteryCount[1]}</span>
              </div>
              <div className="mastery-row">
                <span className="mastery-dot success" />
                <span>已掌握</span>
                <span className="mastery-num">{masteryCount[2]}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
