import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { CompanyService } from './company.service.js';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(':id')
  getCompanyDetails(
    @Param('id') companyId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.companyService.getCompanyById(companyId, userId);
  }
}
