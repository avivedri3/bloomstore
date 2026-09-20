import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function resolveDocFile(relativeFromRepoRoot: string): string | undefined {
  const candidates = [
    join(process.cwd(), relativeFromRepoRoot),
    join(process.cwd(), '..', '..', relativeFromRepoRoot),
    join(__dirname, '..', '..', '..', '..', relativeFromRepoRoot),
  ];
  return candidates.find((p) => existsSync(p));
}

@ApiTags('documentation')
@Controller('docs')
export class DocsController {
  @Get('readme')
  @ApiOperation({ summary: 'API readme (Markdown)' })
  @ApiProduces('text/markdown')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  apiReadme(@Res() res: Response): void {
    const path = resolveDocFile('apps/backend/README.md');
    if (!path) {
      res.status(404).send('# API readme not found\n');
      return;
    }
    res.send(readFileSync(path, 'utf8'));
  }

  @Get()
  @ApiOperation({ summary: 'Hebrew project book (Markdown)' })
  @ApiProduces('text/markdown')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  stream(@Res() res: Response): void {
    const path = resolveDocFile('docs/project-book.md');
    if (!path) {
      res.status(404).send('# Documentation not found\n');
      return;
    }
    res.send(readFileSync(path, 'utf8'));
  }
}
