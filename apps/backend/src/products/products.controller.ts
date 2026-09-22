import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ApiAuth, ApiEnvelopeOk } from '../common/swagger';
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
  @ApiAuth()
  @ApiOperation({ summary: 'Admin: create product' })
  @ApiEnvelopeOk()
  async create(@Body() body: unknown, @Req() req: { user: JwtPayload }) {
    return ok(await this.products.create(body, req.user.sub));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  @ApiAuth()
  @ApiOperation({ summary: 'Admin: update product' })
  @ApiEnvelopeOk()
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: { user: JwtPayload },
  ) {
    return ok(await this.products.update(id, body, req.user.sub));
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
