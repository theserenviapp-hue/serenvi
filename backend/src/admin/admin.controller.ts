import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ClerkGuard } from '../common/clerk.guard';
import { AdminGuard } from '../common/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(ClerkGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('deposits')
  async getDeposits(@Query('status') status?: string) {
    return this.adminService.getDeposits(status);
  }

  @Post('deposits/:id/approve')
  async approveDeposit(@Param('id') id: string) {
    return this.adminService.approveDeposit(id);
  }

  @Post('deposits/:id/reject')
  async rejectDeposit(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectDeposit(id, reason);
  }

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Get('orders')
  async getAllOrders(@Query('status') status?: string) {
    return this.adminService.getAllOrders(status);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }
}
