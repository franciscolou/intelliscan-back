import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register-dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login-dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async register(dto: RegisterDto): Promise<User> { 
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userService.create({
      name: dto.username,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userService.findByName(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const valid_password = await bcrypt.compare(password, user.password);
    if (!valid_password) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { username: user.name, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return access_token;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
