import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishChoice } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

//여기의 옵션은 한가지만 가지게된다.. 예를들어
//피자 는 X XL S이 있는데.. 여기는 피자에서 선택된 옵션사항(ex- L)
//이렇게 선택되게 된다!
@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;
  @Field((type) => String, { nullable: true })
  choice?: string;
  @Field((type) => Int, { nullable: true })
  extra?: number;
}

//dish entity에서는 그 한개음식의 세부적인 맛, 재료등을 저장못해
//여기서 다시 만들어(option을 import할걸) 저장할것임!
@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  //*********************중요중요*************************** */
  //하나의 음식은 여러 맛의 세부사항 오더를 가질수있음
  //여기 manytoone은 dish에서 어떻게 orderitem을 가져올지 신경안써도됨!
  //연결시킨게아니기에..?\
  //->우리는 항상 반대의 관계에서 어떻게 되는지 명시해줄 필요는 없다
  //반대쪽 관계에서 접근을 하고 싶을때만 해주면되는것임!
  //예를들어 손님(owner)->식당일때 식당의 주인을 보고싶고 주인이 가진
  //식당을 보고싶을때 inverse(역)도 생각해줘야한다!
  //즉 dish에서 orderitem을 보고 싶지않음.. 여기서(orderitem)에서
  //dish.정보만 접근하길 원함!
  //*********************중요중요*************************** */
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  //relation ship 으로 (SQL)로 할수있지만 json의 강력함을 보여주기위해
  //relation ship 으로 하게되면.. 주인장이 맛을 없애고 바꾸면 그전에
  //있던 주문들이랑 오류가 생길수있기에 relation방식으로 연결시키지 않는것임!
  //option은 order가 생성되고 완료될때 한번 text로 그냥 저장만 된다 보면됨!
  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
