import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { CampaignModule } from './campaign/campaign.module.js';
import { PeopleModule } from './people/people.module.js';
import { CompanyModule } from './company/company.module.js';
import { SnippetsModule } from './snippets/snippets.module.js';
import { CircuitBreakerController } from './circuit-breaker/circuit-breaker.controller.js';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service.js';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CampaignModule,
    PeopleModule,
    CompanyModule,
    SnippetsModule,
  ],
  controllers: [AppController, CircuitBreakerController],
  providers: [AppService, PrismaService, CircuitBreakerService],
})
export class AppModule {}
