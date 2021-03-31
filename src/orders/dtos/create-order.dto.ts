import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  //여기의 옵션은 한가지만 가지게된다.. 예를들어
  //피자 는 X XL S이 있는데.. 여기는 피자에서 선택된 옵션사항(ex- L)
  //이렇게 선택되게 된다!
  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

// export class CreateOrderInput extends PickType(Order, ['items']) {
// 위에껄 하게되면 order넣을때마다 dish의 모든 정보(photo description)
//등을 넣어줘야한다.. 말도안된다.. order넣을때
//음식id와 option만 받아오면 된다! 그래서 밑에껄로 고침!!
@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  orderId?: number;
}
