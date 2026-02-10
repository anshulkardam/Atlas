import { Module } from '@nestjs/common';
import { PeopleService } from './people.service.js';
import { PeopleController } from './people.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [PeopleController],
  providers: [PeopleService, PrismaService],
})
export class PeopleModule {}
