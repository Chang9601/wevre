import { Redis } from 'ioredis';
import { Schema as MongooseSchema } from 'mongoose';

export class SocketSessionStore {
  constructor(private redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async save(
    sessionId: string,
    userId: MongooseSchema.Types.ObjectId,
  ): Promise<void> {
    await this.redisClient
      // multi() 메서드는 트랜잭션 블록의 시작을 표시하며 이후의 명령은 exec() 메서드를 사용하여 원자적으로 실행되기 위해 대기열에 들어간다.
      .multi()
      .hset(`socket:session#${sessionId}`, 'user', userId.toString())
      .expire(`socket:session#${sessionId}`, process.env.SOCKET_SESSION_TTL)
      .exec();
  }

  async find(sessionId: string): Promise<MongooseSchema.Types.ObjectId> {
    const userId: unknown = await this.redisClient.hget(
      `socket:session#${sessionId}`,
      'user',
    );

    return userId as MongooseSchema.Types.ObjectId;
  }
}
