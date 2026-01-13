import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .limit(1)

    if (error) return NextResponse.json({ error })

    if (data && data.length > 0) {
        return NextResponse.json({ keys: Object.keys(data[0]), sample: data[0] })
    }

    return NextResponse.json({ message: 'No nodes found' })
}
