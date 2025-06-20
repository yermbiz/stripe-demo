import { Controller, Post, Body, Req, Get, Render } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('pay')
  async pay(@Body() dto: CreateCheckoutSessionDto) {
    const session = await this.stripeService.createCheckoutSession(dto);
    return { url: session.url };
  }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: Request) {
    await this.stripeService.handleWebhook(req);
    return { received: true };
  }

  @Get('success')
  @Render('success')
  successPage() {
    return {};
  }

  @Get('cancel')
  @Render('cancel')
  cancelPage() {
    return {};
  }
}
