import { BadRequestException } from '@nestjs/common';
import {
  isProductImageMime,
  PRODUCT_IMAGE_MAX_BYTES,
  type ProductImageMimeType,
} from '@bloomstore/shared-types';
import { randomBytes } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface UploadedProductImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const EXTENSIONS: Record<ProductImageMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const SAVED_IMAGE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp|gif)$/;

export function productUploadsDir(): string {
  return join(process.cwd(), 'uploads', 'products');
}

export function publicProductImageUrl(origin: string, filename: string): string {
  return `${origin.replace(/\/$/, '')}/uploads/products/${filename}`;
}

export async function saveProductImage(file: UploadedProductImage | undefined): Promise<string> {
  const image = assertProductImage(file);
  const filename = `${randomBytes(16).toString('hex')}${EXTENSIONS[image.mimetype]}`;
  const dir = productUploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), image.buffer);
  return filename;
}

export function uploadedProductFilename(imageUrl: string): string | null {
  try {
    const name = new URL(imageUrl).pathname.split('/').pop() ?? '';
    return SAVED_IMAGE_NAME.test(name) ? name : null;
  } catch {
    return null;
  }
}

export async function removeProductImage(filename: string): Promise<void> {
  if (!SAVED_IMAGE_NAME.test(filename)) {
    return;
  }
  await rm(join(productUploadsDir(), filename), { force: true });
}

function assertProductImage(
  file: UploadedProductImage | undefined,
): UploadedProductImage & { mimetype: ProductImageMimeType } {
  if (!file?.buffer?.length) {
    throw new BadRequestException({ code: 'IMAGE_REQUIRED', message: 'Choose an image file' });
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES || file.buffer.length > PRODUCT_IMAGE_MAX_BYTES) {
    throw new BadRequestException({
      code: 'IMAGE_TOO_LARGE',
      message: 'Image must be 5 MB or smaller',
    });
  }
  if (!isProductImageMime(file.mimetype) || !hasImageSignature(file.buffer, file.mimetype)) {
    throw new BadRequestException({
      code: 'INVALID_IMAGE',
      message: 'Upload a JPEG, PNG, WebP, or GIF image',
    });
  }
  return { ...file, mimetype: file.mimetype };
}

function hasImageSignature(buffer: Buffer, mime: ProductImageMimeType): boolean {
  if (mime === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (mime === 'image/gif') {
    const head = buffer.subarray(0, 6).toString('ascii');
    return head === 'GIF87a' || head === 'GIF89a';
  }
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}
