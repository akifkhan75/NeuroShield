import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // @UseGuards(AuthGuard)
  @Get()
  async getSettings(@Request() req: any) {
    // Hardcode a mock user ID until auth is implemented
    // We will assume a seed user with this ID exists or fetch the first user
    const mockUserId = req.user?.id || 'mock-user-id';
    return this.settingsService.getSettings(mockUserId);
  }

  // @UseGuards(AuthGuard)
  @Put()
  async updateSettings(@Request() req: any, @Body() body: any) {
    const mockUserId = req.user?.id || 'mock-user-id';
    return this.settingsService.updateSettings(mockUserId, body);
  }
}
