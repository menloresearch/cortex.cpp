import { Module } from '@nestjs/common';
import { ChatController } from '@/infrastructure/controllers/chat.controller';
import { ChatUsecases } from './chat.usecases';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { ExtensionModule } from '@/infrastructure/repositories/extensions/extension.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { ModelRepositoryModule } from '@/infrastructure/repositories/models/model.module';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingsController } from '@/infrastructure/controllers/embeddings.controller';

@Module({
  imports: [
    DatabaseModule,
    ExtensionModule,
    TelemetryModule,
    ModelRepositoryModule,
    HttpModule,
  ],
  controllers: [ChatController, EmbeddingsController],
  providers: [ChatUsecases],
  exports: [ChatUsecases],
})
export class ChatModule {}
