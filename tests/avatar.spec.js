import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '../src/components/Avatar.vue'

describe('Avatar Component', () => {
  it('renders initials for name "John Doe"', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe'
      }
    })
    expect(wrapper.text()).toBe('JD')
  })

  // ... (keep existing tests, add new ones)
  it('renders image when imageSrc is provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        imageSrc: 'https://example.com/avatar.png'
      }
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/avatar.png')
  })

  it('uses alt prop when provided in accessible label', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        imageSrc: 'https://example.com/avatar.png',
        alt: 'Profile Picture'
      }
    })
    const container = wrapper.find('.container')
    expect(container.attributes('aria-label')).toBe('Profile Picture')
  })

  it('uses fallback alt text when alt prop is missing', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        imageSrc: 'https://example.com/avatar.png'
      }
    })
    const container = wrapper.find('.container')
    expect(container.attributes('aria-label')).toBe('Avatar of John Doe')
  })

  it('includes status in accessible label', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        status: 'online'
      }
    })
    const container = wrapper.find('.container')
    expect(container.attributes('aria-label')).toBe('Avatar of John Doe. User is online')
  })

  it('computes 3 letter initials correctly', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John von Neumann'
      }
    })
    expect(wrapper.text()).toBe('JVN')
  })

  it('uses legacy colors when useLegacyColors is true', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        useLegacyColors: true
      }
    })
    const div = wrapper.find('.avatar')
    expect(div.attributes('style')).toContain('background: rgb(0, 150, 136)') 
  })

  it('uses different modern colors for different names', () => {
    const wrapper1 = mount(Avatar, { props: { name: 'A' } })
    const wrapper2 = mount(Avatar, { props: { name: 'B' } })
    
    const style1 = wrapper1.find('.avatar').attributes('style')
    const style2 = wrapper2.find('.avatar').attributes('style')
    
    expect(style1).not.toBe(style2)
  })

  it('emits error event and shows initials when image fails to load', async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        imageSrc: 'https://example.com/broken.png'
      }
    })
    
    // Simulate error on img
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    
    await img.trigger('error')
    
    // Check event emission
    expect(wrapper.emitted('error')).toBeTruthy()
    
    // Check fallback to initials
    // img should be gone, div with JD should be there
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.avatar').exists()).toBe(true)
    expect(wrapper.text()).toBe('JD')
  })

  it('has role="img" by default', () => {
    const wrapper = mount(Avatar, { props: { name: 'User' } })
    expect(wrapper.find('.container').attributes('role')).toBe('img')
    expect(wrapper.find('.container').attributes('tabindex')).toBe(undefined)
  })

  it('has role="button" when interactive', () => {
    const wrapper = mount(Avatar, { props: { name: 'User', interactive: true } })
    expect(wrapper.find('.container').attributes('role')).toBe('button')
    expect(wrapper.find('.container').attributes('tabindex')).toBe('0')
  })

  it('emits activate event when interactive and clicked/keypressed', async () => {
    const wrapper = mount(Avatar, { props: { name: 'User', interactive: true } })
    const container = wrapper.find('.container')
    
    await container.trigger('click')
    expect(wrapper.emitted('activate')).toHaveLength(1)
    
    await container.trigger('keydown.enter')
    expect(wrapper.emitted('activate')).toHaveLength(2)
    
    await container.trigger('keydown.space')
    expect(wrapper.emitted('activate')).toHaveLength(3)
  })

  it('does not emit activate event when not interactive', async () => {
    const wrapper = mount(Avatar, { props: { name: 'User', interactive: false } })
    const container = wrapper.find('.container')
    
    await container.trigger('click')
    expect(wrapper.emitted('activate')).toBeFalsy()
  })

  it('exposes CSS variables on root element', () => {
    const wrapper = mount(Avatar, {
      props: {
        name: 'John Doe',
        size: 100,
        rounded: true
      }
    })
    const container = wrapper.find('.container')
    const style = container.attributes('style')
    
    expect(style).toContain('--va-size: 100px')
    expect(style).toContain('--va-radius: 50%')
    expect(style).toContain('--va-font-size:') 
    expect(style).toContain('--va-bg:')
    expect(style).toContain('--va-color:')
  })

  it('renders content in status slot', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe' },
      slots: {
        status: '<div class="custom-status"></div>'
      }
    })
    
    expect(wrapper.find('.custom-status').exists()).toBe(true)
    expect(wrapper.find('.status-indicator').exists()).toBe(true)
  })

  it('renders content in overlay slot', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe' },
      slots: {
        overlay: '<div class="overlay-badge">1</div>'
      }
    })
    
    expect(wrapper.find('.overlay-badge').exists()).toBe(true)
  })
  
  it('uses light mode when light prop is true', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe', light: true }
    })
    // In light mode: light color is used for bg (or inverted logic)
    // Actually:
    // isLight = true
    // displayBackground = colors.light
    // displayColor = colors.dark
    // Default (Dark mode): BG=Dark, Color=Light
    // Light mode: BG=Light, Color=Dark
    
    // We can't easily assert exact colors without mocking, but we can assume
    // the style attribute reflects the inverted colors.
    
    // Let's just check that it renders without error and we could check that it is different from default?
    const wrapperDefault = mount(Avatar, { props: { name: 'John Doe' } });
    
    const styleLight = wrapper.find('.container').attributes('style');
    const styleDefault = wrapperDefault.find('.container').attributes('style');
    
    expect(styleLight).not.toBe(styleDefault);
  })

  it('uses light mode when inverted prop is true (legacy alias)', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe', inverted: true }
    })
    const wrapperLight = mount(Avatar, {
      props: { name: 'John Doe', light: true }
    })
    
    const styleInverted = wrapper.find('.container').attributes('style');
    const styleLight = wrapperLight.find('.container').attributes('style');
    
    expect(styleInverted).toBe(styleLight);
  })
})