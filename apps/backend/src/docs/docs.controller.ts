import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Controller('docs')
export class DocsController {
  @Get()
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  stream(@Res() res: Response): void {
    const candidates = [
      join(process.cwd(), 'docs', 'project-book.md'),
      join(process.cwd(), '..', '..', 'docs', 'project-book.md'),
      join(__dirname, '..', '..', '..', '..', 'docs', 'project-book.md'),
    ];
    const path = candidates.find((p) => existsSync(p));
    if (!path) {
      res.status(404).send('# Documentation not found\n');
      return;
    }
    res.send(readFileSync(path, 'utf8'));
  }
}
