const KEY = 'devkit-seen-tips'

export function useProTip(_toolId: string) {
  const getSeenTips = (): string[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
    catch { return [] }
  }

  const markSeen = (tipId: string) => {
    const seen = getSeenTips()
    if (!seen.includes(tipId)) {
      localStorage.setItem(KEY, JSON.stringify([...seen, tipId]))
    }
  }

  const isSeen = (tipId: string) => getSeenTips().includes(tipId)

  return { markSeen, isSeen }
}
