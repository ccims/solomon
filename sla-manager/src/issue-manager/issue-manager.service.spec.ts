import { Test, TestingModule } from '@nestjs/testing';
import { IssueManagerService } from './issue-manager.service';

describe('IssueManagerService', () => {
  let service: IssueManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IssueManagerService],
    }).compile();

    service = module.get<IssueManagerService>(IssueManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
