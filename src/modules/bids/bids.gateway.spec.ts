import { Test, TestingModule } from '@nestjs/testing';

import { BidsGateway } from './bids.gateway';
import { BidsService } from './bids.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

describe('BidsGateway', () => {
  let bidsGateway: BidsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsGateway,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn(),
          },
        },
        {
          provide: BidsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    bidsGateway = module.get<BidsGateway>(BidsGateway);
  });

  it('should be defined.', () => {
    expect(bidsGateway).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
