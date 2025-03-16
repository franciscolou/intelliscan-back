import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsNotEmpty()
    documentId: string;
}