interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests or create new array
    let userRequests = this.requests.get(userId) || [];
    
    // Filter out old requests
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    if (userRequests.length < this.config.maxRequests) {
      userRequests.push(now);
      this.requests.set(userId, userRequests);
      return true;
    }
    
    return false;
  }

  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const userRequests = this.requests.get(userId) || [];
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }

  getTimeUntilReset(userId: string): number {
    const userRequests = this.requests.get(userId) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return Math.max(0, oldestRequest + this.config.windowMs - Date.now());
  }
}

// Create instances for different rate limits
export const chatLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000 // 1 minute
});

export const adWatchLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000 // 5 minutes
});
