import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { TodoApp } from '@/components/todo-app'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  return <TodoApp user={user} initialTodos={todos ?? []} />
}
