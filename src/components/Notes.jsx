import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Notes.css'

const SUBJECTS = [
  '职业能力倾向测验(D类)',
  '综合应用能力(D类)',
  '辅导员专业知识',
]

export default function Notes() {
  const [notes, setNotes] = useLocalStorage('studyNotes', [])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ subject: SUBJECTS[0], title: '', content: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    if (editId) {
      setNotes(notes.map(n => n.id === editId ? { ...n, ...form, updatedAt: new Date().toISOString() } : n))
      setEditId(null)
    } else {
      setNotes([{ ...form, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...notes])
    }
    setForm({ subject: SUBJECTS[0], title: '', content: '' })
    setShowForm(false)
  }

  const startEdit = (note) => {
    setForm({ subject: note.subject, title: note.title, content: note.content })
    setEditId(note.id)
    setShowForm(true)
  }

  const deleteNote = (id) => {
    if (confirm('确定删除这条笔记？')) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const filtered = filter === 'all' ? notes : notes.filter(n => n.subject === filter)

  return (
    <div className="notes">
      <div className="card">
        <div className="notes-header">
          <h2>📒 知识点笔记 ({notes.length} 条)</h2>
          <button className="add-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ subject: SUBJECTS[0], title: '', content: '' }) }}>
            {showForm ? '✕ 取消' : '+ 新建笔记'}
          </button>
        </div>

        {showForm && (
          <form className="note-form" onSubmit={handleSubmit}>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              placeholder="标题..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="笔记内容..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={6}
            />
            <button type="submit" className="submit-btn">
              {editId ? '更新笔记' : '保存笔记'}
            </button>
          </form>
        )}

        <div className="filters">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">全部科目</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">暂无笔记</p>
        ) : (
          <div className="note-list">
            {filtered.map(n => (
              <div key={n.id} className="note-card">
                <div className="note-top">
                  <span className="q-subject">{n.subject}</span>
                  <span className="q-date">{n.updatedAt?.slice(0, 10)}</span>
                </div>
                <h3 className="note-title">{n.title}</h3>
                <p className="note-content">{n.content}</p>
                <div className="note-actions">
                  <button className="edit-btn" onClick={() => startEdit(n)}>✏️ 编辑</button>
                  <button className="del-btn" onClick={() => deleteNote(n.id)}>🗑 删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
