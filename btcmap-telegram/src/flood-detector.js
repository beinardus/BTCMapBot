class FloodDetector {
  constructor({ main_interval = 600_000, flood_interval = 60_000, threshold = 3 } = {}) {
    this.buffers = new Map(); // per-recipient state
    this.main_interval = main_interval;
    this.flood_interval = flood_interval;
    this.threshold = threshold;
  }

  async detectFlooding(recipient, data, sendDirect, sendFlood) {
    let buffer = this.buffers.get(recipient.id);

    if (!buffer) {
      buffer = { count: 0, overflow: [], timer: null };
      this.buffers.set(recipient.id, buffer);

      // cleanup timer
      buffer.timer = setTimeout(() => {
        this.buffers.delete(recipient.id);
      }, this.main_interval);
    }

    buffer.count++;

    const abortOnFailure = async (promise) => {
      try {
        await promise;
      } 
      catch {
        clearTimeout(buffer.timer);
        this.buffers.delete(recipient.id);
      }
    };

    const sendFloodWrapper = async () => {
      this.buffers.delete(recipient.id);
      if (buffer.overflow.length > 0) 
        await sendFlood(recipient, buffer.overflow);
      
    };

    if (buffer.count < this.threshold) 
      await abortOnFailure(sendDirect(recipient, data));
    else {
      buffer.overflow.push(data);

      clearTimeout(buffer.timer);
      buffer.timer = setTimeout(() => {
        abortOnFailure(sendFloodWrapper());
      }, this.flood_interval);
    }
  }

  clear() {
    // helper for tests: clears all timers + state
    for (const buf of this.buffers.values()) 
      clearTimeout(buf.timer);
    
    this.buffers.clear();
  }
}

export { FloodDetector };
