import {
  Args,
  Int,
  Mutation,
  Query,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { Category } from './entities/category.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';

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
    @Args('inputhere') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser, //owner가 여기안에 잇을것임!
      createRestaurantInput,
    );
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }

  //모든 레스토랑 보기!!!!
  @Query((returns) => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  //다이나믹 필드이다.. DB에 저장안될것임!!
  //resolver에서 계산만되어 보여주는 field임!~
  //category entity에 들어가겠습니다!(DB는 저장안됨!)
  // name coverImg slug restaurants 등이 만들어있지만(안넣어도)
  // resolvedField를 통해 category entity에 들어감!
  //그래프 큐엘에서 볼수있음!
  // {
  //   allCategories{
  //     ok
  //     error
  //     categories{
  //       slug
  //       name
  //       restaurantCount
  //     }
  //   }
  // } 이렇게 볼수있음
  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  //1. 여기서 카테고리의 배열이 나올것이고
  //2. 그배열이마나 카테고리 type 하나하나의 객체를 가지고
  //3. 그 객체안에 포함된 restaurantCount가 service의
  //4. countRestaurants에 의해 one To many 하나의 카테고리가
  //5. 얼마나 많은 레스토랑의 갯수를 가지고 있는지 알수있음!!
  //6. 연결고리를 잘 찾자!! 여기서 시작된다!
  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((type) => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation((type) => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation((type) => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}

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
