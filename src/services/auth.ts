type SocialProvider = 'google' | 'facebook' | 'apple' | 'instagram' | 'tiktok' | 'twitter';

export const auth = {
  async socialLogin(provider: SocialProvider) {
    try {
      // TODO: Replace with actual OAuth flow
      const mockResponse = {
        success: true,
        user: {
          id: Math.random().toString(36).substr(2, 9),
          username: `User_${Math.floor(Math.random() * 1000)}`,
          provider
        }
      };
      
      localStorage.setItem('auth_user', JSON.stringify(mockResponse.user));
      return mockResponse;
    } catch (error) {
      console.error(`${provider} auth failed:`, error);
      throw error;
    }
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('auth_user');
  },

  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
};
