import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, DocumentService, PrismaService]
})
export class ChatModule {}
