import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';

//***************************************************** */
//여기 파일은 전부 localhost:3000/graphql 위치의 쿼리와 mutation
// 등을 위한것이라 생각하면된다!!
//restaurant module에서 provider에 그래프큐엘을 위한 요기 파일과
//서비스.. 디비를위한 메소드를 위한 부분을 넣어져있다!
//********************************************************* */

//resolver 와 query 둘다 graphql에서 imported되야함!

// Resolver는 Restaurant의 리졸버가됨!
//@Resolver() ()안에 안써도됨!
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser, //owner가 여기안에 잇을것임!
      createRestaurantInput,
    );
    // @Query((returns) => [Restaurant])
    // //그래프큐엘에서는 []안에 객체타입의 배열의 종류를 쓰면되고
    // // 보통은  Restaurant[] 식으로 한다!
    // restaurants(): Promise<Restaurant[]> {
    //   //getAll에서 find()를 쓰고있기에 async이다
    //   //그래서 promise를 사용해줘야함!
    //   return this.restaurantService.getAll();
    // }

    // // @Query((returns) => [Restaurant])
    // // //그래프큐엘에서는 []안에 객체타입의 배열의 종류를 쓰면되고
    // // // 보통은  Restaurant[] 식으로 한다!
    // // restaurantstwo(
    // //   @Args('veganOnly') veganOnly: boolean,
    // //   @Args('veganOnlyTwo') veganOnlyTwo: boolean,
    // // ): Restaurant[] {
    // //   return [];
    // // }

    // // @Query(() => Boolean)
    // // //위에 리턴타입은 graphql을 위한것임!!
    // // isPizzaGood(): boolean {
    // //   //여기 위에 리턴은 타입스크립을 위한거임!
    // //   return true;
    // // }

    // //Dto를 만들어서 한번에 보내준다!!
    // @Mutation((returns) => Boolean)
    // async createRestaurant(
    //   @Args('input') createRestaurantDto: CreateRestaurantDto,
    // ): Promise<boolean> {
    //   try {
    //     await this.restaurantService.createRestaurant(createRestaurantDto);
    //     return true;
    //   } catch (e) {
    //     console.log(e);
    //     return false;
    //   }
    // }

    //Nest기본공부한것에 여기를 보면됨,,arg 여러개 보낼건지 하나쓸껀지!!
    //받아오는것이 inputType이면 무조껀 Args에 이름이 아무거나 있어야함!
    //ArgsType이면 이름 없어도됨!
    // @Mutation((returns) => Boolean)
    // async updateRestaurant(
    //   @Args('input') updateRestaurantDto: UpdateRestaurantDto,
    // ): Promise<boolean> {
    //   try {
    //     await this.restaurantService.updateRestaurant(updateRestaurantDto);
    //     return true;
    //   } catch (e) {
    //     console.log(e);
    //     return false;
    //   }
    // }
  }
}
