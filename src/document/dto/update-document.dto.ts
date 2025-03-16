import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(40)
    title?: string;

    lastActivity?: Date;
}
