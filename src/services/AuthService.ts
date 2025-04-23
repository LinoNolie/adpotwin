export class AuthService {
  static async login(username: string, password: string) {
    // Replace with actual API call
    if (username === 'admin' && password === 'adpot2024') {
      return {
        token: 'mock-admin-token',
        user: {
          id: 1,
          username: 'admin',
          role: 'admin'
        }
      };
    }

    // Simulate regular user login
    return {
      token: 'mock-user-token',
      user: {
        id: 2,
        username,
        role: 'user'
      }
    };
  }

  static async socialLogin(provider: string) {
    // Replace with actual social auth implementation
    return {
      token: `mock-${provider}-token`,
      user: {
        id: 3,
        username: `${provider}User`,
        role: 'user'
      }
    };
  }

  static async validateToken(token: string) {
    // Replace with actual token validation
    if (token === 'mock-admin-token') {
      return {
        id: 1,
        username: 'admin',
        role: 'admin'
      };
    }
    return {
      id: 2,
      username: 'user',
      role: 'user'
    };
  }
}
