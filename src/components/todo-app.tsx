'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

type Todo = {
  id: string
  title: string
  completed: boolean
  created_at: string
}

type Filter = 'all' | 'active' | 'completed'

export function TodoApp({ user, initialTodos }: { user: User; initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { editRef.current?.focus() }, [editingId])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = input.trim()
    if (!title) return

    setInput('')
    const tempId = crypto.randomUUID()
    const optimistic: Todo = { id: tempId, title, completed: false, created_at: new Date().toISOString() }
    setTodos(prev => [optimistic, ...prev])

    const { data, error } = await supabase
      .from('todos')
      .insert({ title, user_id: user.id })
      .select()
      .single()

    if (data) {
      setTodos(prev => prev.map(t => t.id === tempId ? data : t))
    } else if (error) {
      setTodos(prev => prev.filter(t => t.id !== tempId))
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
    await supabase.from('todos').update({ completed: !completed }).eq('id', id)
  }

  const deleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
    await supabase.from('todos').delete().eq('id', id)
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.title)
  }

  const saveEdit = async (id: string) => {
    const title = editText.trim()
    if (!title) return deleteTodo(id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    setEditingId(null)
    await supabase.from('todos').update({ title }).eq('id', id)
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    setTodos(prev => prev.filter(t => !t.completed))
    for (const id of completedIds) {
      await supabase.from('todos').delete().eq('id', id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const filtered = todos.filter(t => {
    // Search filter
    if (search.trim() && !t.title.toLowerCase().includes(search.trim().toLowerCase())) {
      return false
    }
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length
  const avatar = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="font-semibold tracking-tight">Todo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {avatar && (
                <img src={avatar} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="text-sm text-zinc-400 hidden sm:inline">{name}</span>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Add todo */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-white text-zinc-900 font-medium px-5 py-3 rounded-xl hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Add
            </button>
          </div>
        </form>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search todos..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
          />
        </div>

        {/* Filter tabs */}
        {todos.length > 0 && (
          <div className="flex items-center gap-1 mb-4 bg-zinc-900/50 p-1 rounded-lg w-fit">
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all capitalize ${
                  filter === f
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f} {f === 'active' ? `(${activeCount})` : f === 'completed' ? `(${completedCount})` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Todo list */}
        <div className="space-y-1">
          {filtered.map(todo => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-zinc-900/50 transition-all"
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  todo.completed
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {todo.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {editingId === todo.id ? (
                <input
                  ref={editRef}
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(todo.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 bg-transparent border-b border-zinc-600 py-0.5 focus:outline-none text-zinc-100"
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(todo)}
                  className={`flex-1 cursor-default select-none transition-all ${
                    todo.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
                  }`}
                >
                  {todo.title}
                </span>
              )}

              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {todos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-zinc-500">No todos yet. Add one above!</p>
          </div>
        )}

        {filtered.length === 0 && todos.length > 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600">No {filter} todos.</p>
          </div>
        )}

        {/* Footer */}
        {completedCount > 0 && (
          <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-sm text-zinc-500">
            <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
            <button
              onClick={clearCompleted}
              className="hover:text-zinc-300 transition-colors"
            >
              Clear completed ({completedCount})
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
