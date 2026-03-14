import React, { useState, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { questions } from '../data/questions'
import './Practice.css'

const SUBJECTS = ['全部', '职业能力倾向测验(D类)', '综合应用能力(D类)', '辅导员专业知识']

export default function Practice() {
  const [practiceLog, setPracticeLog] = useLocalStorage('practiceLog', [])
  const [wrongQuestions, setWrongQuestions] = useLocalStorage('wrongQuestions', [])
  const [subject, setSubject] = useState('全部')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [mode, setMode] = useState('sequential') // sequential | random
  const [stats, setStats] = useLocalStorage('practiceStats', { correct: 0, wrong: 0, total: 0 })

  const filtered = useMemo(() => {
    const list = subject === '全部' ? questions : questions.filter(q => q.subject === subject)
    if (mode === 'random') return [...list].sort(() => Math.random() - 0.5)
    return list
  }, [subject, mode])

  const current = filtered[currentIdx]

  if (!current) {
    return (
      <div className="practice">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>🎉 当前科目题目已做完</p>
          <button className="primary-btn" onClick={() => { setCurrentIdx(0); setSelected(null); setShowAnswer(false) }} style={{ marginTop: 16 }}>
            重新开始
          </button>
        </div>
      </div>
    )
  }

  const handleSelect = (option) => {
    if (showAnswer) return
    const letter = option.charAt(0)
    setSelected(letter)
    setShowAnswer(true)

    const isCorrect = letter === current.answer
    const todayKey = new Date().toISOString().slice(0, 10)

    // 记录练习
    setPracticeLog(prev => [...prev, {
      questionId: current.id,
      subject: current.subject,
      topic: current.topic,
      correct: isCorrect,
      date: todayKey,
    }])

    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }))

    // 答错自动加入错题本
    if (!isCorrect) {
      const exists = wrongQuestions.find(q => q.id === current.id)
      if (!exists) {
        setWrongQuestions(prev => [{
          id: current.id,
          subject: current.subject,
          topic: current.topic,
          question: current.question + '\n' + current.options.join('\n'),
          answer: `正确答案：${current.answer}\n${current.explanation}`,
          note: '',
          mastery: 0,
          date: todayKey,
          reviewCount: 0,
        }, ...prev])
      }
    }
  }

  const next = () => {
    setCurrentIdx(i => i + 1)
    setSelected(null)
    setShowAnswer(false)
  }

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

  return (
    <div className="practice">
      <div className="card practice-controls">
        <div className="practice-top">
          <select value={subject} onChange={e => { setSubject(e.target.value); setCurrentIdx(0); setSelected(null); setShowAnswer(false) }}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'sequential' ? 'active' : ''}`} onClick={() => { setMode('sequential'); setCurrentIdx(0); setSelected(null); setShowAnswer(false) }}>
              顺序刷题
            </button>
            <button className={`mode-btn ${mode === 'random' ? 'active' : ''}`} onClick={() => { setMode('random'); setCurrentIdx(0); setSelected(null); setShowAnswer(false) }}>
              随机刷题
            </button>
          </div>
        </div>
        <div className="practice-stats-bar">
          <span>已做 <b>{stats.total}</b> 题</span>
          <span>正确 <b className="green">{stats.correct}</b></span>
          <span>错误 <b className="red">{stats.wrong}</b></span>
          <span>正确率 <b className="blue">{accuracy}%</b></span>
          <button className="reset-stats" onClick={() => setStats({ correct: 0, wrong: 0, total: 0 })}>重置统计</button>
        </div>
      </div>

      <div className="card question-panel">
        <div className="q-info">
          <span className="q-subject">{current.subject}</span>
          <span className="q-topic">{current.topic}</span>
          <span className="q-progress">{currentIdx + 1} / {filtered.length}</span>
        </div>
        <h3 className="q-text">{current.question}</h3>
        <div className="options-list">
          {current.options.map((opt, i) => {
            const letter = opt.charAt(0)
            let cls = 'option-btn'
            if (showAnswer) {
              if (letter === current.answer) cls += ' correct'
              else if (letter === selected) cls += ' wrong'
            } else if (letter === selected) {
              cls += ' selected'
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(opt)}>
                {opt}
              </button>
            )
          })}
        </div>
        {showAnswer && (
          <div className="explanation">
            <div className={`result-tag ${selected === current.answer ? 'correct' : 'wrong'}`}>
              {selected === current.answer ? '✅ 回答正确' : `❌ 回答错误，正确答案是 ${current.answer}`}
            </div>
            <p className="explain-text">💡 {current.explanation}</p>
            <button className="primary-btn" onClick={next}>下一题 →</button>
          </div>
        )}
      </div>
    </div>
  )
}
