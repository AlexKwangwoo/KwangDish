import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //여기추가한건 nestJS가 시작될떄마다 실행시킬것이라는것!!constructor이니깐!
    // console.log('시작!!?');
    // this.sendEmail('testing', 'test')
    //   .then(() => {
    //     console.log('Message sent');
    //   })
    //   .catch((error) => {
    //     console.log(error.response.body);
    //   });
  }

  //다른사람한테 보내고싶으면 하나의 arg를 더 추가 하면된다!
  //v:은 변수를 보내는 방법이다.. 메일건 탬플릿에 변수를 썼기에...
  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append(
      'from',
      `Kwangwoo from KwangDish <mailgun@${this.options.domain}>`,
    );
    form.append('to', `bnc3049@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    // form.append('v:code', 'asasas');
    // form.append('v:username', 'nico!!!'); 이걸 밑에껄로 한다!
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      //nodejs는fetch가 없어서 request npm썼는데
      //이제 지원중단해서 got을 쓰기로함!!
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }
  //kwangdish는 탬플릿 이름이다! 메일건에서!!
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'kwangdish', [
      { key: 'code', value: code },
      { key: 'username', value: email },
      //여기서는 이메일이 그냥 유저이름이 된다.. 템플릿설정 ex)Dear bnc3049@gmail.com
    ]);
  }
}
