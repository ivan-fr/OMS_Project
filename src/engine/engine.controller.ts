import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessEventDto } from '../events/business-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EngineService } from './engine.service';

@ApiTags('Events')
@Controller('events')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recevoir un événement métier (US08)' })
  @ApiBody({ type: BusinessEventDto })
  async receiveEvent(
    @Req() req: { user: { sub: string } },
    @Body() dto: BusinessEventDto,
  ) {
    return this.engineService.receiveEvent(req.user.sub, dto);
  }
}
