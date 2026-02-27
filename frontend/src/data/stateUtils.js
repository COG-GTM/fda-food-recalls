export const STATE_NAMES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"
]

export const STATE_INITIALS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE",
  "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
  "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"
]

/**
 * Count recalls per state from recall data.
 * Each recall has a distribution_pattern field containing state names/initials or "Nationwide".
 */
// Abbreviations that collide with common English words
export const AMBIGUOUS_ABBREVS = new Set(['IN', 'OR', 'ME', 'OK', 'HI', 'OH'])

/**
 * Check if a word list looks like a list of state abbreviations
 * (i.e., contains at least 2 unambiguous 2-letter state codes).
 */
export function hasAbbreviationContext(words) {
  const unambiguousSet = new Set(STATE_INITIALS.filter(a => !AMBIGUOUS_ABBREVS.has(a)))
  let count = 0
  for (const w of words) {
    if (unambiguousSet.has(w)) count++
    if (count >= 2) return true
  }
  return false
}

export function countRecallsByState(recalls, distributionField = 'distribution_pattern') {
  const counts = {}
  STATE_NAMES.forEach(name => { counts[name] = 0 })

  recalls.forEach(recall => {
    const pattern = (recall[distributionField] || '').replace(/,/g, ' ')
    const patternLower = pattern.toLowerCase()
    const words = pattern.split(/\s+/)

    const isNationwide = words.some(w => w.toLowerCase() === 'nationwide')
    const abbrevContext = hasAbbreviationContext(words)

    STATE_NAMES.forEach((name, idx) => {
      const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Use negative lookbehind to prevent "Virginia" matching inside "West Virginia"
      const prefix = name === 'Virginia' ? '(?<!west )' : ''
      const regex = new RegExp(prefix + '\\b' + escaped + '\\b', 'i')
      const abbrev = STATE_INITIALS[idx]
      // For ambiguous abbreviations (IN, OR, ME, etc.), only match if
      // the text contains other unambiguous state abbreviations nearby
      const abbrevMatch = words.includes(abbrev) &&
        (!AMBIGUOUS_ABBREVS.has(abbrev) || abbrevContext)
      if (isNationwide || regex.test(patternLower) || abbrevMatch) {
        counts[name] += 1
      }
    })
  })

  return counts
}

/**
 * Count recalls by firm and return top N firms.
 */
export function countRecallsByFirm(recalls, firmField = 'recalling_firm', topN = 10) {
  const firmCounts = {}

  recalls.forEach(recall => {
    const firm = recall[firmField] || 'Unknown'
    firmCounts[firm] = (firmCounts[firm] || 0) + 1
  })

  const sorted = Object.entries(firmCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)

  return {
    firmNames: sorted.map(e => e[0]),
    firmCounts: sorted.map(e => e[1]),
  }
}

/**
 * Filter recalls by classification.
 */
export function filterByClass(recalls, class1, class2, class3) {
  if (!class1 && !class2 && !class3) return []

  return recalls.filter(r => {
    if (class1 && r.classification === 'Class I') return true
    if (class2 && r.classification === 'Class II') return true
    if (class3 && r.classification === 'Class III') return true
    return false
  })
}
