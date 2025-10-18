let lastCall = 0;
const queue = [];
let running = false;

export async function throttle(fn, delay) {
  return new Promise((resolve, reject) => {
    // push the call along with its delay
    queue.push({ fn, delay, resolve, reject });

    if (!running) processQueue();
  });

  async function processQueue() {
    running = true;

    while (queue.length > 0) {
      const { fn, delay, resolve, reject } = queue.shift();

      const now = Date.now();
      const waitTime = Math.max(0, delay - (now - lastCall));
      if (waitTime > 0) await new Promise(res => setTimeout(res, waitTime));

      lastCall = Date.now();

      try {
        const result = await fn();
        resolve(result);
      }
      catch (err) {
        reject(err);
      }
    }

    running = false;
  }
}
