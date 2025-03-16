import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, UploadedFile, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';


@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File, @Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    const authorId = req.user.id;
    return this.documentService.create(file, { ...createDocumentDto, authorId });
  }
  
  @Get('user/all')
  @UseGuards(JwtAuthGuard)
  findAllByUserId(@Request() req) {
    const userId = req.user.id;
    return this.documentService.findAllByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.documentService.findOne(userId, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Request() req) {
    const userId = req.user.id;
    return this.documentService.update(userId, id, updateDocumentDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.documentService.delete(userId, id);
  }
}
