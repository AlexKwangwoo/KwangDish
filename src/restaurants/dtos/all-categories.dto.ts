import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  //?: 이기에 nullable: true로 해줘야함!
  @Field((type) => [Category], { nullable: true }) //여긴그래프큐엘
  categories?: Category[];
  //밑에는 타입스크립
  //있어도되고 없어도 된다!
}
