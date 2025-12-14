import { describe, it, expect } from 'vitest'
import { getInitials } from '../../src/utils/initials'

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
})
