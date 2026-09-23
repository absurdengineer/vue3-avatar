import { describe, it, expect, vi } from 'vitest'
import { countGraphemes, getInitials, splitGraphemes } from '../../src/utils/initials'

describe('getInitials', () => {
  it('returns single initial for single name', () => {
    expect(getInitials('Tony')).toBe('T')
  })

  it('returns two initials for First Last', () => {
    expect(getInitials('Tony Stark')).toBe('TS')
  })

  it('returns three initials for First Middle Last', () => {
    expect(getInitials('Tony Howard Stark')).toBe('THS')
  })

  it('handles more than 3 names by taking first, second and last', () => {
    expect(getInitials('Albert Tony Howard Stark')).toBe('ATS')
  })

  it('handles hyphens as separators', () => {
    expect(getInitials('Tony-Stark')).toBe('TS')
  })

  it('handles mixed spaces and hyphens', () => {
    expect(getInitials('Tony Howard-Stark')).toBe('THS')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  Tony   Stark  ')).toBe('TS')
  })

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(getInitials(null)).toBe('')
    expect(getInitials(undefined)).toBe('')
  })

  it('keeps supplementary characters together', () => {
    expect(getInitials('😀')).toBe('😀')
    expect(getInitials('😀 Smith')).toBe('😀S')
  })

  it('keeps combining marks attached to their base character', () => {
    const name = 'e\u0301clair smith'
    expect(getInitials(name)).toBe('E\u0301S')
    expect(splitGraphemes('e\u0301')).toEqual(['e\u0301'])
  })

  it('keeps emoji ZWJ sequences and flags together', () => {
    expect(getInitials('👩‍💻 Doe')).toBe('👩‍💻D')
    expect(splitGraphemes('🇩🇪')).toEqual(['🇩🇪'])
  })

  it('counts visible graphemes rather than UTF-16 code units', () => {
    expect(countGraphemes('👩‍💻E\u0301')).toBe(2)
  })

  it('keeps fallback graphemes intact without Intl.Segmenter', () => {
    const original = (Intl as typeof Intl & { Segmenter?: unknown }).Segmenter
    vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })

    try {
      expect(splitGraphemes('🇩🇪👩‍💻e\u0301')).toEqual(['🇩🇪', '👩‍💻', 'e\u0301'])
    } finally {
      vi.unstubAllGlobals()
      if (original) expect((Intl as typeof Intl & { Segmenter?: unknown }).Segmenter).toBe(original)
    }
  })
})
