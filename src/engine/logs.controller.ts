import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppLogHelperService } from '../appLog/app-log-helper.service';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly appLogHelper: AppLogHelperService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les 100 derniers logs applicatifs' })
  async getLogs(@Req() req: { user: { sub: string } }) {
    return this.appLogHelper.getLatestLogs();
  }
}
