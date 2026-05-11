import { useEffect, useState } from 'react'

export function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1)
      }, 1000)
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false)
      // Play a sound when timer finishes
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.play().catch(e => console.log('Audio play failed', e))
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, secondsLeft])

  const startTimer = (seconds: number) => {
    setSecondsLeft(seconds)
    setIsActive(true)
  }

  const stopTimer = () => {
    setIsActive(false)
    setSecondsLeft(0)
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fit-card p-4 mt-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-stone-950 dark:text-stone-100">Rest Timer</h3>
            {isActive || secondsLeft > 0 ? (
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatTime(secondsLeft)}
              </p>
            ) : (
              <p className="text-sm text-stone-500">Ready to rest?</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          {isActive ? (
            <button onClick={stopTimer} className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">Stop</button>
          ) : (
            <>
              <button onClick={() => startTimer(30)} className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300">30s</button>
              <button onClick={() => startTimer(60)} className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300">60s</button>
              <button onClick={() => startTimer(90)} className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300">90s</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
