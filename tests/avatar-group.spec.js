import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AvatarGroup from '../src/components/AvatarGroup.vue'
import Avatar from '../src/components/Avatar.vue'
import { h } from 'vue'

describe('AvatarGroup Component', () => {
  it('renders all children when max is not set', () => {
    const wrapper = mount(AvatarGroup, {
      slots: {
        default: () => [
          h('div', { class: 'av' }, '1'),
          h('div', { class: 'av' }, '2')
        ]
      }
    })
    expect(wrapper.findAll('.av')).toHaveLength(2)
    expect(wrapper.find('.avatar-overflow').exists()).toBe(false)
  })

  it('renders limited children and overflow badge when max is set', () => {
    const wrapper = mount(AvatarGroup, {
      props: { max: 2 },
      slots: {
        default: () => [
            h('div', { class: 'av' }, '1'),
            h('div', { class: 'av' }, '2'),
            h('div', { class: 'av' }, '3')
        ]
      }
    })
    
    expect(wrapper.findAll('.av')).toHaveLength(2)
    expect(wrapper.find('.avatar-overflow').exists()).toBe(true)
    expect(wrapper.find('.avatar-overflow').text()).toBe('+1')
  })

  it('applies overlap style', () => {
    const wrapper = mount(AvatarGroup, {
      props: { overlap: 20 }
    })
    expect(wrapper.attributes('style')).toContain('--va-group-overlap: -20px')
  })

  it('passes props to child components', () => {
    const wrapper = mount(AvatarGroup, {
      props: { size: 60, borderColor: 'red' },
      slots: {
        default: () => [
          h(Avatar, { name: 'John Doe' }),
        ]
      }
    })
    const avatar = wrapper.findComponent(Avatar)
    expect(avatar.props('size')).toBe(60)
    expect(avatar.props('borderColor')).toBe('red')
  })

  it('applies triangle layout', () => {
    const wrapper = mount(AvatarGroup, {
      props: { layout: 'triangle' }
    })
    expect(wrapper.classes()).toContain('layout-triangle')
  })
})
