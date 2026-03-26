import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppLogDto } from './dto/app-log.dto';

@Injectable()
export class AppLogHelperService {
  private readonly logger = new Logger(AppLogHelperService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(log: CreateAppLogDto): Promise<void> {
    await this.prisma.appLog.create({
      data: {
        level: log.level,
        message: log.message,
        context: log.context
          ? (log.context as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async safeCreate(log: CreateAppLogDto): Promise<void> {
    try {
      await this.create(log);
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Unable to persist app log: ${details}`);
    }
  }

  async getLogsForUser(userId: string) {
    const logs = await this.prisma.appLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return logs
      .filter((log) => {
        if (
          !log.context ||
          typeof log.context !== 'object' ||
          Array.isArray(log.context)
        ) {
          return false;
        }

        const contextUserId = (log.context as Record<string, unknown>).userId;
        return typeof contextUserId === 'string' && contextUserId === userId;
      })
      .slice(0, 50);
  }

  async info(message: string, context?: Record<string, unknown>) {
    await this.safeCreate({ level: 'info', message, context });
  }

  async warning(message: string, context?: Record<string, unknown>) {
    await this.safeCreate({ level: 'warning', message, context });
  }

  async error(message: string, context?: Record<string, unknown>) {
    await this.safeCreate({ level: 'error', message, context });
  }
}
