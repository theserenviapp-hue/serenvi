import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ClerkGuard } from './clerk.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [ClerkGuard],
  exports: [ClerkGuard],
})
export class CommonModule {}
