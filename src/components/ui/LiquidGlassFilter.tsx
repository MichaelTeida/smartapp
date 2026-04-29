export default function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" className="absolute w-0 h-0 overflow-hidden">
      <defs>
        <filter id="glass-clean-v5">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
