import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field((type) => String)
  name: string;
  @Field((type) => Int, { nullable: true })
  extra?: number;
}

//DishOption 밑에 option에 저장할것임!
//@InputType('DishOptionInputType'
//@InputType('DishInputType' 같지 않아야 중복이안된다!
@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field((type) => String)
  name: string;
  @Field((type) => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(2)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field((type) => String)
  @Column()
  @Length(3, 140)
  description: string;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  //RelationId 는 밑의 친구가 가리키는것의 ID를 가져온다!
  //dish.restaurant의 restaurant는 밑의 친구를 가리킨다!
  //@Field((type) => Restaurant)
  // @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
  //   onDelete: 'CASCADE',
  // })
  // restaurant: Restaurant;
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  //type json은 json data를 저장한다
  //dishoption을 entity에 넣기싫다!
  // 옵션을 relation ship 으로 넣을수있지만 다르게 해보겠음!
  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
