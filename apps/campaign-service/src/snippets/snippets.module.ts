import { Module } from '@nestjs/common';
import { SnippetsService } from './snippets.service.js';
import { SnippetsController } from './snippets.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [SnippetsController],
  providers: [SnippetsService, PrismaService],
})
export class SnippetsModule {}
