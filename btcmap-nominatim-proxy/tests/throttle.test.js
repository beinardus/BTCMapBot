const { throttle } = require("../src/throttle.js");

describe("throttle", () => {

  test("executes calls sequentially with the correct delay", async () => {
    const calls = [];
    const delay = 20; // small delay for fast tests

    const fn = jest.fn(() => {
      calls.push(Date.now());
      return Promise.resolve(Date.now());
    });

    const promises = [
      throttle(fn, delay),
      throttle(fn, delay),
      throttle(fn, delay),
    ];

    await Promise.all(promises);

    // Ensure each call happened at least `delay` ms after the previous one
    for (let i = 1; i < calls.length; i++) {
      const diff = calls[i] - calls[i - 1];
      expect(diff).toBeGreaterThanOrEqual(delay);
    }

    expect(fn).toHaveBeenCalledTimes(3);
  });

  test("propagates errors to the caller but keeps the queue alive", async () => {
    const delay = 10; // small delay

    const fn1 = jest.fn(() => Promise.reject(new Error("fail")));
    const fn2 = jest.fn(() => Promise.resolve("ok"));

    const p1 = throttle(fn1, delay);
    const p2 = throttle(fn2, delay);

    // Await both promises
    await expect(p1).rejects.toThrow("fail");
    await expect(p2).resolves.toBe("ok");

    // Ensure both functions were called
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  test("caller can catch errors and queue continues", async () => {
    const delay = 10;

    const fn1 = jest.fn(() => Promise.reject(new Error("fail")));
    const fn2 = jest.fn(() => Promise.resolve("ok"));

    let caught = null;

    try {
      await throttle(fn1, delay);
    } catch (err) {
      // caller's catch block
      caught = err;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe("fail");
    expect(fn1).toHaveBeenCalledTimes(1);

    // Ensure the next call still runs
    const result2 = await throttle(fn2, delay);
    expect(result2).toBe("ok");
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
