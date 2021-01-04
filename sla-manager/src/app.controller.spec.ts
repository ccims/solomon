import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { SlaRulesService } from './sla-rules.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [SlaRulesService]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
