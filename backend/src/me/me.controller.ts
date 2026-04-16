import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ClerkGuard } from '../common/clerk.guard';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(ClerkGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getMe(@Req() req: any) {
    return this.meService.getCurrentUser(req.user.userId);
  }

  @Post('onboarding')
  async completeOnboarding(
    @Req() req: any,
    @Body() body: { name?: string; phone: string; referralCode?: string },
  ) {
    return this.meService.completeOnboarding(req.user.userId, body);
  }
}
