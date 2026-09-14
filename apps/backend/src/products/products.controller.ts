import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { TokenVersionGuard } from '../auth/token-version.guard';
import { ok } from '../common/http';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list(@Query('category') category?: string) {
    return ok(await this.products.listPublic(category));
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  async adminList() {
    return ok(await this.products.listAdmin());
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return ok(await this.products.getPublic(id));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  async create(@Body() body: unknown, @Req() req: { user: JwtPayload }) {
    return ok(await this.products.create(body, req.user.sub));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: { user: JwtPayload },
  ) {
    return ok(await this.products.update(id, body, req.user.sub));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), TokenVersionGuard, AdminGuard)
  async remove(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    await this.products.softDelete(id, req.user.sub);
    return ok({ deleted: true });
  }
}
