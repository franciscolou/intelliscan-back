import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  title: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;
}