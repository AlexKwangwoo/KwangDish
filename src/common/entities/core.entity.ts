import { Field } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

//여기는 모든곳에서 공통으로 쓰여질 친구들이 올것임!!
//그래서 여기서 다른친구들 거름이 됨!!
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  //자동으로 날짜가 들어가게됨
  @CreateDateColumn()
  @Field((type) => Date)
  createdAt: Date;

  //업데이트할때마다 자동으로 날짜가 갱신됨!
  @UpdateDateColumn()
  @Field((type) => Date)
  updatedAt: Date;
}
