import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  //어떤 레스토랑에 추가할 것인가?
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
