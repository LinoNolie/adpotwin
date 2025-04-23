import { InteractionManager } from 'react-native';
import { logger } from './logger';

class Performance {
  constructor() {
    this.measurements = new Map();
    this.thresholds = new Map();
    this.frameDrops = [];
    this.lastFrameTimestamp = null;
  }

  startMeasurement(key) {
    this.measurements.set(key, {
      startTime: performance.now(),
      marks: []
    });
  }

  mark(key, markName) {
    const measurement = this.measurements.get(key);
    if (measurement) {
      measurement.marks.push({
        name: markName,
        timestamp: performance.now()
      });
    }
  }

  endMeasurement(key) {
    const measurement = this.measurements.get(key);
    if (measurement) {
      const endTime = performance.now();
      const duration = endTime - measurement.startTime;
      
      const threshold = this.thresholds.get(key);
      if (threshold && duration > threshold) {
        logger.warn(`Performance threshold exceeded for ${key}`, {
          duration,
          threshold,
          marks: measurement.marks
        });
      }

      this.measurements.delete(key);
      return {
        duration,
        marks: measurement.marks
      };
    }
    return null;
  }

  setThreshold(key, duration) {
    this.thresholds.set(key, duration);
  }

  async scheduleWork(work, priority = 'normal') {
    return new Promise((resolve) => {
      if (priority === 'high') {
        resolve(work());
      } else {
        InteractionManager.runAfterInteractions(() => {
          resolve(work());
        });
      }
    });
  }

  startFrameMonitor() {
    this.frameCallback = (timestamp) => {
      if (this.lastFrameTimestamp) {
        const frameDuration = timestamp - this.lastFrameTimestamp;
        if (frameDuration > (1000 / 55)) { // Detect drops below 55 FPS
          this.frameDrops.push({
            timestamp,
            duration: frameDuration
          });

          if (this.frameDrops.length > 60) {
            this.frameDrops.shift();
          }

          if (frameDuration > (1000 / 30)) { // Severe frame drop below 30 FPS
            logger.warn('Severe frame drop detected', {
              duration: frameDuration,
              fps: 1000 / frameDuration
            });
          }
        }
      }
      this.lastFrameTimestamp = timestamp;
      this.frameId = requestAnimationFrame(this.frameCallback);
    };

    this.frameId = requestAnimationFrame(this.frameCallback);
  }

  stopFrameMonitor() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      this.lastFrameTimestamp = null;
    }
  }

  getFrameMetrics() {
    if (this.frameDrops.length === 0) return null;

    const totalDrops = this.frameDrops.length;
    const averageDuration = this.frameDrops.reduce((sum, drop) => 
      sum + drop.duration, 0) / totalDrops;
    const worstDrop = Math.max(...this.frameDrops.map(drop => drop.duration));

    return {
      totalDrops,
      averageDuration,
      worstDrop,
      averageFPS: 1000 / averageDuration,
      worstFPS: 1000 / worstDrop
    };
  }

  async* memoryProfile(duration = 5000, interval = 1000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < duration) {
      if (global.performance && global.performance.memory) {
        yield {
          timestamp: Date.now(),
          usedHeapSize: global.performance.memory.usedJSHeapSize,
          totalHeapSize: global.performance.memory.totalJSHeapSize,
          heapSizeLimit: global.performance.memory.jsHeapSizeLimit
        };
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  clearMetrics() {
    this.measurements.clear();
    this.frameDrops = [];
    this.lastFrameTimestamp = null;
  }
}

export const performance = new Performance();