import { Test, TestingModule } from '@nestjs/testing';
import { IssueManagerController } from './issue-manager.controller';

describe('IssueManagerController', () => {
  let controller: IssueManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueManagerController],
    }).compile();

    controller = module.get<IssueManagerController>(IssueManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
