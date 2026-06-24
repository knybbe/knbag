interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const sizes = {
  sm: { kn: 'text-2xl', bag: 'text-lg', tag: 'text-xs' },
  md: { kn: 'text-4xl', bag: 'text-2xl', tag: 'text-sm' },
  lg: { kn: 'text-5xl', bag: 'text-3xl', tag: 'text-base' },
}

export function BrandLogo({ size = 'md', showTagline = false }: BrandLogoProps) {
  const s = sizes[size]

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-0.5 leading-none">
        <span
          className={`${s.kn} font-display font-extrabold tracking-tighter kn-gradient drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          KN
        </span>
        <span
          className={`${s.bag} font-display font-bold tracking-tight text-slate-300`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          bag
        </span>
      </div>
      {showTagline && (
        <p className={`${s.tag} text-muted font-medium tracking-wide`}>
          Worldwide carry-on checker
        </p>
      )}
    </div>
  )
}