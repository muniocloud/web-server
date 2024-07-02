import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './user.dto';
import { UserRepository } from './user.repository';
import { UploadService } from 'src/upload/upload.service';
import { User } from './user.type';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private readonly uploadService: UploadService,
  ) {}

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      id: user.id,
      password: user.password,
    };
  }

  async createUser(input: CreateUserInput): Promise<boolean> {
    const user = await this.getUserByEmail(input.email);

    if (user) {
      throw new UnauthorizedException('User already exists.');
    }

    let avatarUrl = '';

    if (input.avatar) {
      avatarUrl = await this.uploadService.upload(input.avatar, 'avatar');
    }

    const result = await this.userRepository.createUser({
      ...input,
      avatarUrl,
    });

    return !!result;
  }
}
