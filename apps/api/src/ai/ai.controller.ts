import { Controller, Get, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Get('fake-call-script')
  async getFakeCallScript() {
    return this.aiService.getFakeCallScript();
  }

  @UseGuards(JwtAuthGuard)
  @Get('self-defense-tips')
  async getSelfDefenseTips() {
    return this.aiService.getSelfDefenseTips();
  }
}
