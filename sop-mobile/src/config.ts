// Development: use your computer's IP for physical device testing
// e.g. http://192.168.1.100:3000
// Production: https://yourdomain.com
export const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://yourdomain.com'
