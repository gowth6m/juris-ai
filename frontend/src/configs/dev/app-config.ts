const AppConfig = {
  version: '0.0.1',
  stage: 'dev',
  metadata: {
    title: 'Juris AI',
    description: 'Empower Your Business with AI Contract Review',
    url: 'https://jurisai.uk',
    favicon: '/assets/jurisai.svg',
    appleTouchIcon: '/assets/jurisai.svg',
    ogImage: '/assets/jurisai.svg',
    privacyPolicy: 'https://jurisai.uk/privacy-policy/',
    termsOfService: 'https://jurisai.uk/terms-conditions/',
  },
  assets: {
    icons: [],
    drawerLogo: '/assets/jurisai.jpg',
  },
  endpoints: {
    api: 'https://api.dev.jurisai.uk',
  },
  localStorageKeys: {
    settings: 'jurisai-settings',
    drawer: 'jurisai-drawer',
    theme: 'jurisai-theme',
    auth: 'jurisai-auth',
  },
};

export default AppConfig;
