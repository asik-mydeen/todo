import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('_health_check').select('*').limit(1)
    return NextResponse.json({
      status: 'ok',
      supabase: error ? 'error' : 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ status: 'ok', supabase: 'unconfigured', timestamp: new Date().toISOString() })
  }
}
