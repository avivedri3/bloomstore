import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PRODUCT_IMAGE_MAX_BYTES } from '@bloomstore/shared-types';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
import { OptionalProductImageInterceptor } from './optional-image.interceptor';
import { UploadedProductImage } from './product-image';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Public product catalog' })
  @ApiQuery({ name: 'category', required: false })
  @ApiEnvelopeOk()
  async list(@Query('category') category?: string) {
    return ok(await this.products.listPublic(category));
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @ApiAuth()
  @ApiOperation({ summary: 'Admin: all products' })
  @ApiEnvelopeOk()
  async adminList() {
    return ok(await this.products.listAdmin());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public product by id' })
  @ApiEnvelopeOk()
  async get(@Param('id') id: string) {
    return ok(await this.products.getPublic(id));
  }

  @Post(':id/stock-alerts')
  @ApiOperation({ summary: 'Email me when this product is back in stock' })
  @ApiEnvelopeOk()
  async subscribeStockAlert(@Param('id') id: string, @Body() body: unknown) {
    return ok(await this.products.subscribeStockAlert(id, body));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: PRODUCT_IMAGE_MAX_BYTES, files: 1 },
    }),
  )
  @ApiAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'description', 'category', 'price', 'stock', 'image'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'integer' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Admin: create product with an image file' })
  @ApiEnvelopeOk()
  async create(
    @UploadedFile() file: UploadedProductImage | undefined,
    @Body() body: unknown,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const forwarded = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const origin = `${forwarded || req.protocol}://${req.get('host')}`;
    return ok(await this.products.create(body, file, origin, req.user.sub));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @UseInterceptors(OptionalProductImageInterceptor())
  @ApiAuth()
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'integer' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Admin: update product fields and optionally replace the image' })
  @ApiEnvelopeOk()
  async update(
    @Param('id') id: string,
    @UploadedFile() file: UploadedProductImage | undefined,
    @Body() body: unknown,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const forwarded = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const origin = `${forwarded || req.protocol}://${req.get('host')}`;
    return ok(await this.products.update(id, body, req.user.sub, file, origin));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @ApiAuth()
  @ApiOperation({ summary: 'Admin: soft-delete product' })
  @ApiEnvelopeOk()
  async remove(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    await this.products.softDelete(id, req.user.sub);
    return ok({ deleted: true });
  }
}
