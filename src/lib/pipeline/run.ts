import { fetchAllNews } from './fetch'
import { clusterArticles } from './cluster'
import { publishCluster } from './publish'

export async function runPipeline(maxClusters = 10): Promise<{ published: number; failed: number }> {
  console.log('[Pipeline] Starting news fetch...')
  const rawArticles = await fetchAllNews()
  console.log(`[Pipeline] Fetched ${rawArticles.length} raw articles`)

  const clusters = clusterArticles(rawArticles)
  console.log(`[Pipeline] Created ${clusters.length} clusters`)

  let published = 0
  let failed = 0

  // Process top N clusters
  const toProcess = clusters.slice(0, maxClusters)

  for (const cluster of toProcess) {
    const id = await publishCluster(cluster)
    if (id) {
      published++
      console.log(`[Pipeline] Published article: ${id}`)
    } else {
      failed++
    }
    // Rate limit: 1 article per 3 seconds to respect Claude API limits
    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`[Pipeline] Done. Published: ${published}, Failed: ${failed}`)
  return { published, failed }
}
