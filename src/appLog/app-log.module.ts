import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AppLogHelperService } from './app-log-helper.service';

@Module({
  imports: [PrismaModule],
  providers: [AppLogHelperService],
  exports: [AppLogHelperService],
})
export class AppLogModule {}
