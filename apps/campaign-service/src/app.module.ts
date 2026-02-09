import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { CampaignModule } from './campaign/campaign.module';
import { PeopleModule } from './people/people.module';
import { CompanyModule } from './company/company.module';
import { SnippetsModule } from './snippets/snippets.module';

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
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
