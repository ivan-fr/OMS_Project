import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EngineService } from './engine.service';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly engineService: EngineService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les logs applicatifs de l’utilisateur connecté' })
  async getLogs(@Req() req: { user: { sub: string } }) {
    return this.engineService.getLogsForUser(req.user.sub);
  }
}
