import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HfInference } from '@huggingface/inference';
import { DocumentService } from '../document/document.service';


@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentService: DocumentService
  ) {}

  async create(userId: string, createChatDto: CreateChatDto) {
    const hf = new HfInference(process.env.AI_API_TOKEN);

    const document = await this.prisma.document.findFirstOrThrow({
      where: { id: createChatDto.documentId },
      select: { content: true },
    });

    const chatHistory = await this.prisma.chat.findMany({
      where: { documentId: createChatDto.documentId },
      orderBy: { datetime: 'asc' },
    });

    const formattedChatHistory = chatHistory.length > 0
      ? chatHistory
        .map(chat => `User: ${chat.prompt}\nYou: ${chat.answer}`)
        .join('\n')
      : "(The history is empty)";


    const answer = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: `
        [INST]
        Imagine you are an assistant specialized in answering questions based on bureaucratic documents. You have the task of answering questions that are strictly related to the content of the document provided. 
        If a question is unrelated to the document, you must respond with: "I'm sorry, I can only help you with subjects related to this document."
    
        The following is the text extracted from an image, which contains important information relevant to the question:
    
        === DOCUMENT CONTENT ===
        ${document.content}
        =======================
        
        The next part is the history of the conversation between the user and you. This history is crucial, as you need to consider it when crafting your response, making sure to continue the conversation logically and contextually based on previous exchanges.
    
        === CONVERSATION HISTORY ===
        ${formattedChatHistory}
        ===========================
        
        Now, please answer the following question from the user, based on the document content and the conversation history. Be sure to provide a concise, human-like, and direct response, without any unnecessary introductions. 
    
        QUESTION: ${createChatDto.prompt}
    
        Please respond the most objectively you can, with no headings and MANDATORY in the same language as the question.
        [/INST]
        [END]
      `,
    });

      const answerText = answer.generated_text.split('[END]')[1].trim();

      const chat = this.prisma.chat.create({
        data: {
          prompt: createChatDto.prompt,
          answer: answerText,
          document: {
            connect: { id: createChatDto.documentId },
          },
        }
      });
    
      await this.documentService.update(userId, createChatDto.documentId, {
        lastActivity: new Date(),
      });

      return chat;
      }
}
