import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const nameExists = await this.existsByName(createUserDto.name);
    if (nameExists) {
      throw new ConflictException("There's already a user with this name");
    }
  
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findFirst({
      where: { name: name },
    });
  
    return !!existingUser; // Retorna true se o usuário existir, false se não existir
  }


  async findByName(name: string) {
    return await this.prisma.user.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
