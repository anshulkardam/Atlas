import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Atlas - API Gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
