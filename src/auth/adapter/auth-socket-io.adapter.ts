import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { AuthService } from '../auth.service';

export class AuthSocketIoAdapter extends IoAdapter {
  private authService: AuthService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
  }

  createIOServer(port: number, options: ServerOptions): any {
    options.allowRequest = async (request, allowFunction) => {
      try {
        console.log('first');
        const token = this.authService.getHTTPRequestPlainJWTToken(request);

        if (!token) {
          return allowFunction('Unauthorized', false);
        }

        const success = await this.authService.verifyJWTToken(token);

        if (!success) {
          return allowFunction('Unauthorized', false);
        }
      } catch (e) {
        return allowFunction('Unauthorized', false);
      }

      return allowFunction(null, true);
    };

    return super.createIOServer(port, options);
  }
}
