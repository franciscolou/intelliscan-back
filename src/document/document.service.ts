import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Express } from 'express';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(file: Express.Multer.File, createDocumentDto: CreateDocumentDto) {    
    const { title, authorId } = createDocumentDto;
    const ocrText = await this.extractTextFromImage(file.buffer);

    if (!ocrText || ocrText.trim().length === 0) {
      throw new HttpException("Couldn't extract any text from the file.", HttpStatus.BAD_REQUEST);
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const document = await prisma.document.create({
        data: {
          title,
          image: file.buffer,
          content: ocrText,
          mimetype: file.mimetype, // necessary to reconvert the image when fetched from the db
          author: {
            connect: { id: authorId },
          },
        },
      });

      return document;
    });
    return result;
  }

  private extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Tesseract.recognize(
        imageBuffer,
        'eng'
      )
        .then(({ data: { text } }) => {
          resolve(text);
        })
        .catch((error) => reject(error));
    });
  }

  async findAllByUserId(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        authorId: userId,
      },
    });
  
    const reconvertedImgDocs = documents.map((doc) => {
      const mimeType = doc.mimetype || 'image/jpeg';
      return {
        ...doc,
        image: doc.image ? `data:${mimeType};base64,${Buffer.from(doc.image).toString('base64')}` : null,
      };
    });
  
    return reconvertedImgDocs;
  }
  
  async findOne(userId: string, documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { interactions: true },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.authorId !== userId) {
      throw new HttpException('You do not have access to this document', HttpStatus.FORBIDDEN);
    }

    const mimeType = document.mimetype || 'image/jpeg';
    return {
      ...document,
      image: document.image ? `data:${mimeType};base64,${Buffer.from(document.image).toString('base64')}` : null,
    };
  }

  async update(userId: string, id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
    if (document.authorId !== userId) {
      throw new HttpException('You do not have access to this document', HttpStatus.FORBIDDEN);
    }

    const { title, lastActivity } = updateDocumentDto;

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: { 
        ...(title && { title }),
        ...(lastActivity && { lastActivity })
      },
    });

    return updatedDocument;
  }

  async delete(userId: string, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.authorId !== userId) {
      throw new HttpException('You do not have access to this document', HttpStatus.FORBIDDEN);
    }

    await this.prisma.document.delete({
      where: { 
        id: id,
      },
    });

    return { message: 'Document deleted successfully' };
  }
}
