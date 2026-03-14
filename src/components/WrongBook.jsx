import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './WrongBook.css'

const SUBJECTS = [
  '职业能力倾向测验(D类)',
  '综合应用能力(D类)',
  '辅导员专业知识',
]

const SUB_TOPICS = {
  '职业能力倾向测验(D类)': ['常识判断', '言语理解', '数量关系', '判断推理', '策略选择'],
  '综合应用能力(D类)': ['教育方案设计', '案例分析', '教育活动方案策划'],
  '辅导员专业知识': ['思政教育', '学生管理', '心理健康', '就业指导', '党团建设'],
}

const MASTERY = ['未掌握', '半掌握', '已掌握']

export default function WrongBook() {
  const [questions, setQuestions] = useLocalStorage('wrongQuestions', [])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [masteryFilter, setMasteryFilter] = useState('all')
  const [form, setForm] = useState({
    subject: SUBJECTS[0],
    topic: SUB_TOPICS[SUBJECTS[0]][0],
    question: '',
    answer: '',
    note: '',
    mastery: 0,
  })

  const handleSubjectChange = (subject) => {
    setForm({ ...form, subject, topic: SUB_TOPICS[subject][0] })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.question.trim()) return
    const newQ = {
      ...form,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      reviewCount: 0,
    }
    setQuestions([newQ, ...questions])
    setForm({ subject: SUBJECTS[0], topic: SUB_TOPICS[SUBJECTS[0]][0], question: '', answer: '', note: '', mastery: 0 })
    setShowForm(false)
  }

  const updateMastery = (id, mastery) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, mastery, reviewCount: q.reviewCount + 1 } : q
    ))
  }

  const deleteQuestion = (id) => {
    if (confirm('确定删除这道题？')) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const filtered = questions.filter(q => {
    if (filter !== 'all' && q.subject !== filter) return false
    if (masteryFilter !== 'all' && q.mastery !== Number(masteryFilter)) return false
    return true
  })

  return (
    <div className="wrong-book">
      <div className="card">
        <div className="wrong-header">
          <h2>📝 错题本 ({questions.length} 题)</h2>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ 取消' : '+ 添加错题'}
          </button>
        </div>

        {showForm && (
          <form className="wrong-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <select value={form.subject} onChange={e => handleSubjectChange(e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                {SUB_TOPICS[form.subject].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea
              placeholder="题目内容..."
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
            />
            <textarea
              placeholder="正确答案..."
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
            />
            <textarea
              placeholder="错因分析/笔记（可选）..."
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
            />
            <button type="submit" className="submit-btn">保存错题</button>
          </form>
        )}

        <div className="filters">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">全部科目</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={masteryFilter} onChange={e => setMasteryFilter(e.target.value)}>
            <option value="all">全部状态</option>
            <option value="0">未掌握</option>
            <option value="1">半掌握</option>
            <option value="2">已掌握</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">暂无错题记录</p>
        ) : (
          <div className="question-list">
            {filtered.map(q => (
              <div key={q.id} className={`question-card mastery-${q.mastery}`}>
                <div className="q-header">
                  <span className="q-subject">{q.subject}</span>
                  <span className="q-topic">{q.topic}</span>
                  <span className="q-date">{q.date}</span>
                </div>
                <div className="q-content">{q.question}</div>
                <div className="q-answer">
                  <span className="label">答案：</span>{q.answer}
                </div>
                {q.note && <div className="q-note"><span className="label">笔记：</span>{q.note}</div>}
                <div className="q-footer">
                  <div className="mastery-btns">
                    {MASTERY.map((m, i) => (
                      <button
                        key={i}
                        className={`mastery-btn m-${i} ${q.mastery === i ? 'active' : ''}`}
                        onClick={() => updateMastery(q.id, i)}
                      >{m}</button>
                    ))}
                  </div>
                  <span className="review-count">复习 {q.reviewCount} 次</span>
                  <button className="del-btn" onClick={() => deleteQuestion(q.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
