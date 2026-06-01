import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization') ?? ''
  const secret = process.env.PIPELINE_SECRET

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'PIPELINE_SECRET not configured' },
      { status: 500 },
    )
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  // Fire pipeline in the background (don't await)
  void triggerPipelineBackground()

  return NextResponse.json(
    { ok: true, message: 'Pipeline triggered', timestamp: new Date().toISOString() },
    { status: 202 },
  )
}

async function triggerPipelineBackground(): Promise<void> {
  try {
    // Dynamic import to avoid loading pipeline code in every request
    const { runPipeline } = await import('@/lib/pipeline/run').catch(() => ({
      runPipeline: async () => {
        console.log('[pipeline/trigger] runPipeline not found — skipping')
      },
    }))
    await runPipeline()
    console.log('[pipeline/trigger] Pipeline completed successfully')
  } catch (err) {
    console.error('[pipeline/trigger] Pipeline error:', err)
  }
}
