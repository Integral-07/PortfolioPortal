import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

type OgpData = {
  title: string | null
  description: string | null
  image: string | null
  url: string
}

export default function OgpCard({ url, label }: { url: string; label: string }) {
  const [ogp, setOgp] = useState<OgpData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ogp?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => setOgp(data))
      .finally(() => setLoading(false))
  }, [url])

  const displayTitle = ogp?.title || label
  const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()

  if (loading) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="glass flex items-center gap-2 rounded-xl px-4 py-3 transition-opacity hover:opacity-80">
        <ExternalLink className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
        <span className="text-sm" style={{ color: 'var(--accent)' }}>{label}</span>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="glass flex overflow-hidden rounded-xl transition-opacity hover:opacity-80"
    >
      {ogp?.image && (
        <img
          src={ogp.image}
          alt=""
          className="h-24 w-36 shrink-0 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className="flex flex-col justify-center gap-1 px-4 py-3 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{displayTitle}</p>
        {ogp?.description && (
          <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{ogp.description}</p>
        )}
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
          <ExternalLink className="h-3 w-3" />
          {hostname}
        </p>
      </div>
    </a>
  )
}
