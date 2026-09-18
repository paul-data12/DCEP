type RateLimitInfo = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitInfo>();

export function rateLimit(ip: string, limit: number, windowMs: number): { success: boolean, resetTime: number } {
  const now = Date.now();
  let info = store.get(ip);

  // Clear expired
  if (info && now > info.resetTime) {
    info = undefined;
  }

  if (!info) {
    info = { count: 1, resetTime: now + windowMs };
    store.set(ip, info);
    return { success: true, resetTime: info.resetTime };
  }

  if (info.count >= limit) {
    return { success: false, resetTime: info.resetTime };
  }

  info.count += 1;
  return { success: true, resetTime: info.resetTime };
}
