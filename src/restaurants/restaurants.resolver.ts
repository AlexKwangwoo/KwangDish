import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
//resolver 와 query 둘다 graphql에서 imported되야함!

// Resolver는 Restaurant의 리졸버가됨!
//@Resolver() ()안에 안써도됨!
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  //그래프큐엘에서는 []안에 객체타입의 배열의 종류를 쓰면되고
  // 보통은  Restaurant[] 식으로 한다!
  myRestaurant(): Restaurant[] {
    return [];
  }

  @Query((returns) => [Restaurant])
  //그래프큐엘에서는 []안에 객체타입의 배열의 종류를 쓰면되고
  // 보통은  Restaurant[] 식으로 한다!
  restaurants(
    @Args('veganOnly') veganOnly: boolean,
    @Args('veganOnlyTwo') veganOnlyTwo: boolean,
  ): Restaurant[] {
    return [];
  }

  // @Query(() => Boolean)
  // //위에 리턴타입은 graphql을 위한것임!!
  // isPizzaGood(): boolean {
  //   //여기 위에 리턴은 타입스크립을 위한거임!
  //   return true;
  // }

  //Dto를 만들어서 한번에 보내준다!!
  @Mutation((returns) => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    console.log(createRestaurantDto);
    return true;
  }
}
