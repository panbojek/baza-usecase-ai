import type { UseCase } from '../types'

interface Props {
  item: UseCase
  label?: boolean
  className?: string
}

type Platform = 'youtube' | 'instagram' | 'x' | 'linkedin' | 'facebook' | 'spotify' | 'link'

function platformOf(link: string): Platform {
  let host = ''
  try {
    host = new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
  if (/youtube|youtu\.be/.test(host)) return 'youtube'
  if (/instagram/.test(host)) return 'instagram'
  if (/(^|\.)x\.com$|twitter/.test(host)) return 'x'
  if (/linkedin/.test(host)) return 'linkedin'
  if (/facebook|fb\./.test(host)) return 'facebook'
  if (/spotify/.test(host)) return 'spotify'
  return 'link'
}

const iconSizeFor = (cls: string): number =>
  cls.includes('rel-thumb') ? 18 : cls.includes('rthumb') ? 30 : cls.includes('dthumb') ? 54 : 46

function PlatformGlyph({ platform, size }: { platform: Platform; size: number }) {
  const knock = 'var(--ph-bg-soft)'
  const common = { width: size, height: size, viewBox: '0 0 24 24' }
  switch (platform) {
    case 'youtube':
      return (
        <svg {...common} fill="currentColor">
          <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12z" />
          <path d="M10 15.2V8.8L15.5 12z" fill={knock} />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.4" />
          <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M17.5 3h3l-6.6 7.6L21.8 21h-6.1l-4.4-5.6L6.1 21H3l7-8.1L2.4 3h6.3l4 5.3L17.5 3zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="3.5" fill="currentColor" />
          <text x="12" y="16.6" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Sora, sans-serif" fill={knock}>
            in
          </text>
        </svg>
      )
    case 'facebook':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="3.5" fill="currentColor" />
          <text x="12" y="17.5" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, serif" fill={knock}>
            f
          </text>
        </svg>
      )
    case 'spotify':
      return (
        <svg {...common} fill="none" stroke={knock} strokeWidth={1.7} strokeLinecap="round">
          <circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none" />
          <path d="M7 10c3-1 7-.7 10 1M7.6 13c2.4-.8 5.4-.5 7.9.9M8.2 15.6c2-.6 4.2-.4 5.9.7" />
        </svg>
      )
    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.6}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" />
        </svg>
      )
  }
}

/** Miniatura: realny obraz, jeśli podany `thumbnail`, inaczej placeholder z ikoną platformy. */
export function Thumb({ item, className = 'thumb' }: Props) {
  if (item.thumbnail) {
    return (
      <div className={className}>
        <img src={item.thumbnail} alt="" loading="lazy" />
      </div>
    )
  }
  const platform = platformOf(item.link)
  return (
    <div className={className}>
      <div className="plat-ph">
        <PlatformGlyph platform={platform} size={iconSizeFor(className)} />
      </div>
    </div>
  )
}
