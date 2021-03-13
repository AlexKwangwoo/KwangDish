import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

//이 모듈이 생성되면 useValue로 new Pubsub사용해 전체 app에 provide할것임!
const pubsub = new PubSub();

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubsub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
