import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2025-05-28.basil',
  });

  constructor(private config: ConfigService, private prisma: PrismaService) {}

  /** POST /pay — returns a live Stripe Checkout URL (test mode) */
  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: this.config.get('CURRENCY') ?? 'usd',
            product_data: { name: dto.product },
            unit_amount: dto.amount, // cents
          },
          quantity: 1,
        },
      ],
      success_url: this.config.get('SUCCESS_URL')!,
      cancel_url: this.config.get('CANCEL_URL')!,
    });

    await this.prisma.payment.create({
      data: {
        stripeSessionId: session.id,
        amount: dto.amount,
        status: 'PENDING',
      },
    });

    console.log('✅ Checkout session created:', session.id);
    return session;
  }

  /** POST /webhook — Stripe sends events here (Premium / Standard) */
  async handleWebhook(req: Request) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    if (!sig || !Buffer.isBuffer(req.body)) {
      throw new BadRequestException('Invalid webhook payload');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.config.get('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err: any) {
      console.error('❌ Signature verification failed:', err.message);
      throw new BadRequestException('Signature verification failed');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await this.prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'PAID' },
      });

      console.log('💰 Payment succeeded, session:', session.id);
    }

    return { received: true };
  }
}
