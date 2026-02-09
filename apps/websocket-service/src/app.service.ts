import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Atlas - Websocket Service',
      timestamp: new Date().toISOString(),
    };
  }
}
