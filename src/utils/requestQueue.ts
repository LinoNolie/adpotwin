type QueuedRequest = {
  id: string;
  request: () => Promise<any>;
  priority: number;
};

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent = 2;
  private activeRequests = 0;

  enqueue(request: () => Promise<any>, priority: number = 0): string {
    const id = Math.random().toString(36).substring(7);
    this.queue.push({ id, request, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
    return id;
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= this.maxConcurrent) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { request } = this.queue.shift()!;
      this.activeRequests++;

      try {
        await request();
      } catch (error) {
        console.error('Request failed:', error);
      } finally {
        this.activeRequests--;
      }
    }

    this.processing = false;
  }
}

export const requestQueue = new RequestQueue();
