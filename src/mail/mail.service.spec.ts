import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import got from 'got';
import * as FormData from 'form-data';

//mailService에있는 (여기 위에있는게 아님!!)
// import got from 'got';
// import * as FormData from 'form-data';
// 위의 got과 FormData를 mock해줌!!
//여기서 하면 자동으로 mailService에도 해줌!
jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      //하면 sendVerificationEmail 실행후 안의 함수 this.sendEmail가 실행되는데
      // spyOn이 가로채서 I love you를 실행 시킨다!
      //sendEmail 도 mock하고싶으나 뒤에서 우리는 진짜 sendEmail함수를 써야하기에
      // spy를 통해 mock하지 않도록 한다!
      //mockImplementation 은 실제 service의 sendEmail가 실행되면 마지막 리턴때
      //mockImplementation가 가로채서 자기의 함수를 실행시킨다
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'kwangdish',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const ok = await service.sendEmail('', '', [
        { key: 'attr', value: 'attrValue' },
      ]);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalledTimes(5);
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });
    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        //got가 일어날때 그속에있는함수post쓸때! 가로체서 에러일을키겠다!
        throw new Error();
      });
      const ok = await service.sendEmail('', '', []);
      expect(ok).toEqual(false);
    });
  });
});
