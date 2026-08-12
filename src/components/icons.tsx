interface IconProps {
  size?: number
  stroke?: string
}

const base = (size: number, stroke: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke,
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconSearch = ({ size = 15, stroke = '#1F293C' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
)

export const IconGrid = ({ size = 16, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const IconList = ({ size = 16, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const IconGraph = ({ size = 17, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <circle cx="5" cy="6" r="2.2" />
    <circle cx="19" cy="9" r="2.2" />
    <circle cx="10" cy="18" r="2.2" />
    <path d="M7.1 6.8l9.8 1.6M17.4 10.7l-5.6 5.6M8.6 15.9L6 8.2" />
  </svg>
)

export const IconExternal = ({ size = 15, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)

export const IconClose = ({ size = 14, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconFolder = ({ size = 15, stroke = 'currentColor' }: IconProps) => (
  <svg {...base(size, stroke)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)
