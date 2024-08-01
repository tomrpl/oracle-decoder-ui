class RedisManager {
  private static instance: RedisManager;
  private readonly UPSTASH_REDIS_REST_URL: string;
  private readonly UPSTASH_REDIS_REST_TOKEN: string;

  private constructor() {
    this.UPSTASH_REDIS_REST_URL =
      process.env.REACT_APP_UPSTASH_REDIS_REST_URL || "";
    this.UPSTASH_REDIS_REST_TOKEN =
      process.env.REACT_APP_UPSTASH_REDIS_REST_TOKEN || "";

    if (!this.UPSTASH_REDIS_REST_URL || !this.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Redis environment variables are not set");
    }
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.UPSTASH_REDIS_REST_TOKEN}`,
    };
  }

  public async getRedisValue(key: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.UPSTASH_REDIS_REST_URL}/get/${key}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.result;
    } catch {
      return null;
    }
  }

  public async incrementRedisValue(key: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.UPSTASH_REDIS_REST_URL}/incr/${key}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.result;
    } catch {
      return null;
    }
  }

  public async setRedisValue(key: string, value: string): Promise<void> {
    try {
      await fetch(`${this.UPSTASH_REDIS_REST_URL}/set/${key}/${value}`, {
        headers: this.getAuthHeaders(),
      });
    } catch {
      // Silently fail
    }
  }

  public async getUserIdByLocation(
    locationAddress: string
  ): Promise<string | null> {
    const totalUsers = await this.getRedisValue("totalUsers");
    if (totalUsers === null) return null;

    for (let i = 1; i <= parseInt(totalUsers); i++) {
      const userId = `user:${i}`;
      const storedLocation = await this.getRedisValue(`${userId}:location`);
      if (storedLocation === locationAddress) {
        return userId;
      }
    }
    return null;
  }

  public async initializeUser(locationAddress: string): Promise<string | null> {
    try {
      // Check if user already exists
      const existingUserId = await this.getUserIdByLocation(locationAddress);
      if (existingUserId) {
        return existingUserId;
      }

      const totalUsers = await this.incrementRedisValue("totalUsers");
      if (totalUsers === null) return null;
      const userId = `user:${totalUsers}`;
      await this.setRedisValue(`${userId}:location`, locationAddress);
      await this.setRedisValue(`${userId}:queries`, "0");
      await this.setRedisValue(`${userId}:createdAt`, new Date().toISOString());
      return userId;
    } catch {
      return null;
    }
  }

  public async recordQuery(
    userId: string,
    locationAddress: string
  ): Promise<void> {
    try {
      const date = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      await this.incrementRedisValue(`${userId}:queries`);
      await this.incrementRedisValue(`${userId}:queries:${date}`);
      await this.incrementRedisValue("totalQueries");
      await this.setRedisValue(`${userId}:location`, locationAddress);
      await this.setRedisValue(
        `${userId}:lastQueryAt`,
        new Date().toISOString()
      );
    } catch {
      // Silently fail
    }
  }
}

// Export functions that use the RedisManager instance
export const initializeUser = async (
  locationAddress: string
): Promise<string | null> => {
  return RedisManager.getInstance().initializeUser(locationAddress);
};

export const recordQuery = async (
  userId: string,
  locationAddress: string
): Promise<void> => {
  return RedisManager.getInstance().recordQuery(userId, locationAddress);
};
