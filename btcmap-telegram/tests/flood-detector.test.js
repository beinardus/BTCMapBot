// FloodDetector.test.js
import { FloodDetector } from "../src/flood-detector.js";

jest.useFakeTimers();

describe("FloodDetector", () => {
  let detector, sendDirect, sendFlood, recipient;

  beforeEach(() => {
    detector = new FloodDetector({
      main_interval: 600_000, // 10 minutes
      flood_interval: 60_000, // 1 minute
      threshold: 3,
    });
    sendDirect = jest.fn(() => Promise.resolve());
    sendFlood = jest.fn(() => Promise.resolve());
    recipient = { id: "chat-123" };
  });

  afterEach(() => {
    detector.clear();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test("first messages go direct until threshold is reached", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);

    expect(sendDirect).toHaveBeenCalledTimes(2);
    expect(sendFlood).not.toHaveBeenCalled();
  });

  test("third+ messages are buffered and sent via flood after flood_interval", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg3", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg4", sendDirect, sendFlood);

    // Advance 60s from last message → flood fires
    jest.advanceTimersByTime(60_000);
    await jest.runOnlyPendingTimersAsync();

    expect(sendFlood).toHaveBeenCalledTimes(1);
    expect(sendFlood).toHaveBeenCalledWith(recipient, ["msg3", "msg4"]);
  });

  test("flood timer resets if more messages arrive before flood_interval", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg3", sendDirect, sendFlood);

    // 30s later, msg4 arrives → resets timer
    jest.advanceTimersByTime(30_000);
    await detector.detectFlooding(recipient, "msg4", sendDirect, sendFlood);

    // Advance 60s from last message → flood fires
    jest.advanceTimersByTime(60_000);
    await jest.runOnlyPendingTimersAsync();

    expect(sendFlood).toHaveBeenCalledTimes(1);
    expect(sendFlood).toHaveBeenCalledWith(recipient, ["msg3", "msg4"]);
  });

  test("buffer is cleared after flood", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg3", sendDirect, sendFlood);

    jest.advanceTimersByTime(60_000);
    await jest.runOnlyPendingTimersAsync();

    expect(sendFlood).toHaveBeenCalledTimes(1);

    // Next message should start fresh
    await detector.detectFlooding(recipient, "msg4", sendDirect, sendFlood);
    expect(sendDirect).toHaveBeenCalledWith(recipient, "msg4");
  });

  test("buffer is cleaned up after main_interval if threshold not reached", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);

    jest.advanceTimersByTime(600_000);
    await jest.runOnlyPendingTimersAsync();

    // Next message treated fresh
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    expect(sendDirect).toHaveBeenCalledWith(recipient, "msg2");
  });

  test("different recipients have independent buffers", async () => {
    const recipientA = { id: "chat-A" };
    const recipientB = { id: "chat-B" };

    // Both send messages under threshold
    await detector.detectFlooding(recipientA, "A1", sendDirect, sendFlood);
    await detector.detectFlooding(recipientB, "B1", sendDirect, sendFlood);
    await detector.detectFlooding(recipientA, "A2", sendDirect, sendFlood);
    await detector.detectFlooding(recipientB, "B2", sendDirect, sendFlood);

    // Push both over threshold
    await detector.detectFlooding(recipientA, "A3", sendDirect, sendFlood);
    await detector.detectFlooding(recipientA, "A4", sendDirect, sendFlood);
    await detector.detectFlooding(recipientB, "B3", sendDirect, sendFlood);

    jest.advanceTimersByTime(60_000);
    await jest.runOnlyPendingTimersAsync();

    expect(sendFlood).toHaveBeenCalledTimes(2);
    expect(sendFlood).toHaveBeenCalledWith(recipientA, ["A3", "A4"]);
    expect(sendFlood).toHaveBeenCalledWith(recipientB, ["B3"]);
  });

  test("buffer is cleared if sendDirect fails", async () => {
    sendDirect.mockRejectedValueOnce(new Error("network fail"));

    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);

    expect(detector.buffers.has(recipient.id)).toBe(false);

    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    expect(sendDirect).toHaveBeenCalledTimes(2);
  });

  test("buffer is cleared if sendFlood fails", async () => {
    await detector.detectFlooding(recipient, "msg1", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg2", sendDirect, sendFlood);
    await detector.detectFlooding(recipient, "msg3", sendDirect, sendFlood);

    sendFlood.mockRejectedValueOnce(new Error("flood fail"));

    jest.advanceTimersByTime(60_000);
    await jest.runOnlyPendingTimersAsync();

    expect(sendFlood).toHaveBeenCalledTimes(1);
    expect(detector.buffers.has(recipient.id)).toBe(false);

    await detector.detectFlooding(recipient, "msg4", sendDirect, sendFlood);
    expect(sendDirect).toHaveBeenCalledWith(recipient, "msg4");
  });
});
