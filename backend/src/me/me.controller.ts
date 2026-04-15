import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ClerkGuard } from '../common/clerk.guard';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(ClerkGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getMe(@Req() req: any) {
    // ClerkGuard has already auto-provisioned and attached req.user
    return this.meService.getCurrentUser(req.user.userId);
  }
}
