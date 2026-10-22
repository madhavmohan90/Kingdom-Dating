// "+20 embers" popup that floats up and fades.
export default function EmberToast({ amount, label }) {
  if (!amount) return null
  return (
    <div className="fixed top-1/3 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="ember-toast px-5 py-3 rounded-2xl bg-kingdom-darker/90 border border-kingdom-gold/40 glow-gold text-center">
        <p className="font-display text-2xl text-shimmer">🔥 +{amount}</p>
        {label && <p className="text-kingdom-gold/70 text-xs font-display mt-1">{label}</p>}
      </div>
    </div>
  )
}
