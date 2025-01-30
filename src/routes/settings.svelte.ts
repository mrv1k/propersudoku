export const settings = $state({
  isVisible: true,
  isValidateInput: false,
  isDarkMode: true
})

export type Settings = typeof settings

export const toggleDarkMode = () => {
  const isDark = document.documentElement.dataset.theme === 'dim';
  document.documentElement.dataset.theme = isDark ? 'garden' : 'dim';
};

