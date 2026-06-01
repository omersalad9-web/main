#!/usr/bin/env tsx
import { runPipeline } from '../src/lib/pipeline/run'
import { saveMarketData } from '../src/lib/market/exchanges'

async function main() {
  const args = process.argv.slice(2)
  const maxClusters = parseInt(args[0] || '5', 10)

  console.log('=== Africa Finance Review Pipeline ===')
  console.log(`Processing up to ${maxClusters} article clusters`)

  // Run news pipeline and market data in parallel
  const [pipelineResult] = await Promise.all([
    runPipeline(maxClusters),
    saveMarketData().catch(err => console.error('Market data failed:', err)),
  ])

  console.log('=== Pipeline Complete ===')
  console.log(`Published: ${pipelineResult.published}`)
  console.log(`Failed: ${pipelineResult.failed}`)

  process.exit(0)
}

main().catch(err => {
  console.error('Pipeline crashed:', err)
  process.exit(1)
})
