import { Field, ObjectType } from '@nestjs/graphql';

//entities는 오브젝트 개념의 리턴타입을 말해준다!
@ObjectType()
export class Restaurant {
  @Field((type) => String)
  name: string;
  //이곳이 플레이그라운드에 타입으로 나옴!

  @Field((type) => Boolean)
  isVegan: boolean;

  @Field((type) => String)
  address: string;

  @Field((type) => String)
  ownersName: string;
}
