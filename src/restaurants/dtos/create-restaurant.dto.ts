import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// 이렇게 하면 @Args 안에 이름을 써야한다!
// object를 전달해야한다
// @InputType()
// export class CreateRestaurantDto {
//   @Field((type) => String)
//   name: string;
//   @Field((type) => Boolean)
//   isVegan: boolean;
//   @Field((type) => String)
//   address: string;
//   @Field((type) => String)
//   ownersName: string;
// }

//argstype은 하나하나의 args를 전달할수있다

@ArgsType()
export class CreateRestaurantDto {
  @Field((type) => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  ownersName: string;
}
