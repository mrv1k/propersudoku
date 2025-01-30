export const settings = $state({
  isVisible: true,
  isValidateInput: true,
  isDarkMode: true
})

export type Settings = typeof settings

export const toggleDarkMode = () => {
  const isDark = document.documentElement.dataset.theme === 'dim';
  document.documentElement.dataset.theme = isDark ? 'garden' : 'dim';
};

