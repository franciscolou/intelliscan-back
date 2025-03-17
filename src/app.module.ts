import { MiddlewareConsumer, NestModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from './document/document.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DocumentModule, ChatModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.status(200).send();
      } else {
        next();
      }
    }).forRoutes('*');
  }
}