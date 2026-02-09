import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Atlas - Campaign Service',
      timestamp: new Date().toISOString(),
    };
  }
}
