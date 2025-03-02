import { HttpsProxyAgent } from "https-proxy-agent";

function injectProxy(options, proxy) {
  if (!proxy)
    return options;

  return {
    ...options,
    https: {
      // allow man-in-the-middle (todo: debug only)
      rejectUnauthorized: false,
    },        
    agent: {
      https: new HttpsProxyAgent(proxy)
    }
  }
}

export {injectProxy}