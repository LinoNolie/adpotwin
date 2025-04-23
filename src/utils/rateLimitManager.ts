interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimitManager {
  private buckets: Map<string, TokenBucket> = new Map();
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private readonly refillInterval: number;
  private readonly maxBackoff: number = 300000; // 5 minutes max backoff
  private userBackoffs: Map<string, number> = new Map();

  constructor(maxMessages: number, windowMs: number) {
    this.maxTokens = maxMessages;
    this.refillInterval = windowMs;
    this.refillRate = maxMessages / (windowMs / 1000);
  }

  canSendMessage(userId: string): boolean {
    // Check if user is in backoff period
    const backoffTime = this.userBackoffs.get(userId) || 0;
    if (Date.now() < backoffTime) {
      return false;
    }

    this.refillTokens(userId);
    const bucket = this.buckets.get(userId);
    
    if (!bucket || bucket.tokens < 1) {
      // Calculate exponential backoff
      const currentBackoff = this.userBackoffs.get(userId) || 5000;
      const newBackoff = Math.min(currentBackoff * 2, this.maxBackoff);
      this.userBackoffs.set(userId, Date.now() + newBackoff);
      return false;
    }

    // Reset backoff on successful message
    this.userBackoffs.delete(userId);
    bucket.tokens--;
    return true;
  }

  getTimeUntilNextMessage(userId: string): number {
    const bucket = this.buckets.get(userId);
    if (!bucket || bucket.tokens > 0) return 0;

    const timeSinceLastRefill = Date.now() - bucket.lastRefill;
    const tokensToAdd = (timeSinceLastRefill / 1000) * this.refillRate;
    if (tokensToAdd >= 1) return 0;

    return Math.ceil((1 - tokensToAdd) / this.refillRate * 1000);
  }

  getRemainingMessages(userId: string): number {
    this.refillTokens(userId);
    const bucket = this.buckets.get(userId);
    return bucket ? Math.floor(bucket.tokens) : this.maxTokens;
  }

  getNextResetTime(userId: string): number {
    const bucket = this.buckets.get(userId);
    if (!bucket) return Date.now();
    
    const tokensNeeded = 1;
    const timeToNextToken = (tokensNeeded - bucket.tokens) / this.refillRate * 1000;
    return Date.now() + Math.max(0, timeToNextToken);
  }

  private refillTokens(userId: string): void {
    let bucket = this.buckets.get(userId);
    const now = Date.now();

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(userId, bucket);
      return;
    }

    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.refillRate;
    
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  clearBucket(userId: string): void {
    this.buckets.delete(userId);
  }
}

// Create singleton instance for chat messages
export const chatRateLimiter = new RateLimitManager(5, 60000); // 5 messages per minute
