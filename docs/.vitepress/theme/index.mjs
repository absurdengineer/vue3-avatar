import DefaultTheme from 'vitepress/theme';
import AvatarPlayground from './components/AvatarPlayground.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AvatarPlayground', AvatarPlayground);
  }
};
