import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendBackInStock(to: string, product: { id: string; name: string }): Promise<void> {
    const shop = this.shopUrl();
    const subject = `${product.name} is back in stock`;
    const text = [
      `Good news — ${product.name} is available again at BloomStore.`,
      '',
      `View it here: ${shop}/products/${product.id}`,
    ].join('\n');
    const html = `<p>Good news — <strong>${escapeHtml(product.name)}</strong> is available again at BloomStore.</p><p><a href="${shop}/products/${product.id}">View the bouquet</a></p>`;

    const webhook = this.config.get<string>('MAIL_WEBHOOK_URL');
    if (webhook) {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to, subject, text, html, productId: product.id }),
      });
      if (!response.ok) {
        throw new Error(`Mail webhook failed (${response.status})`);
      }
      return;
    }

    this.log.log(`[stock-alert] to=${to} subject=${subject}\n${text}`);
  }

  private shopUrl(): string {
    const explicit = this.config.get<string>('FRONTEND_URL');
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }
    const origin = (this.config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
      .split(',')
      .map((value) => value.trim())
      .find(Boolean);
    return origin ? `${origin.replace(/\/$/, '')}/bloomstore` : 'http://localhost:3000/bloomstore';
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
