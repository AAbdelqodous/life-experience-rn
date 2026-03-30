const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  // Disable typedRoutes until `expo start` regenerates expo-env.d.ts with new routes
  experiments: {
    ...appJson.expo.experiments,
    typedRoutes: false,
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  },
};
