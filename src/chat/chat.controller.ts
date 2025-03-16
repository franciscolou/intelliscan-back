import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createChatDto: CreateChatDto, @Request() req) {
    const userId = req.user.id;
    return this.chatService.create(userId, createChatDto);
  }
}
