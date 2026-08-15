import { useRef, useEffect, useCallback } from 'react'

function AutoResizeTextarea({
  value,
  onChange,
  minRows = 1,
  className = '',
  ...props
}) {
  const ref = useRef(null)

  const adjustHeight = useCallback(() => {
    const el = ref.current
    if (!el) return

    const scrollY = window.scrollY
    
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`

    window.scrollTo({ top: scrollY })
  }, [])

  useEffect(() => {
    adjustHeight()    
    requestAnimationFrame(adjustHeight)
  }, [value, adjustHeight])

  const handleChange = (e) => {
    onChange?.(e)
    adjustHeight()
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      rows={minRows}
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-400 font-[inherit] resize-none overflow-hidden ${className}`}
      {...props}
    />
  )
}

export default AutoResizeTextarea
