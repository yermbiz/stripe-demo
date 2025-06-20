import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:   true }),
    PrismaModule,
    StripeModule
  ],
})
export class AppModule {}
