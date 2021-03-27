import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { Like, Raw, Repository } from 'typeorm';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';

import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';

//service에서 만들어주고 resolver에서 적용시킴!!

@Injectable()
export class RestaurantService {
  constructor(
    //밑에껄 inject하기위해 restaurant module에서
    // 가져온것임!! imports: [TypeOrmModule.forFeature([Restaurant])],
    //InjectRepository VS Inject차이는 InjectRepository는 repository기능
    // 다 쓸수있다. ex) findOne, find ...and so on
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    //CategoryRepository 얘는 직접 repositories 파일에 만들어줘서
    //Inject와 위에처럼 할 필요가 없다!
    private readonly categories: CategoryRepository,
  ) {}

  //-------------------------이부분은 repositories파일로 옮겼음!!------------
  // async getOrCreate(name: string): Promise<Category> {
  //   //오너를 알아서 넣어줄것임!!지금 로그인한사람..
  //   //사람들이 koreanBBQ 찾아도 korean-bbq처럼 나올수있게 통합 slug 를 만들자!
  //   const categoryName = name.trim().toLowerCase();
  //   //앞뒤 빈칸이 없을것임!
  //   const categorySlug = categoryName.replace(/ /g, '-'); //빈칸에 다 - 넣겠음!
  //   let category = await this.categories.findOne({ slug: categorySlug });
  //   if (!category) {
  //     //없으면 만들어줄것임!
  //     category = await this.categories.save(
  //       this.categories.create({ slug: categorySlug, name: categoryName }),
  //     );
  //   }
  //   return category;
  // }
  //----------------------------------------------------------------------

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      //오너를 알아서 넣어줄것임!!지금 로그인한사람..
      //사람들이 koreanBBQ 찾아도 korean-bbq처럼 나올수있게 통합 slug 를 만들자!
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        restaurantId: newRestaurant.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        //아무것도 안쓰면 id로 찾는것임!! 처음인자는!
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      //owner.id 는 지금 로그인한 유저!
      //restaurant.ownerId는 지금 고칠려는 레스토랑의 주인 ID
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      //카테고리 업데이트 할지 결정! 있으면 하고 없으면 무시!
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          //id를 보내지않으면 새로운 restaurant를 업데이트한다는것임
          //id를 보내 어떤 레스토랑을 업데이트 할것인지 정해야한다!
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          //category가 있으면 category속성을 줄것임!
          ...(category && { category }),
          //...과 {} 만나면 지워진다! 즉위에꺼는 category : category라는뜻!
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete restaurant.',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
        //all-categorioes에 있는 categories?: 이 반환됨!
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  //여기에 의해서 각각의 카테고리당 몇개의 one to Many
  //하나가 몇개의 레스토랑이 가지고있는지 볼수있음
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      //한카테고리에 300개가 나올수있기에 페이지로 나누기위해
      //밑에  { relations: ['restaurants'] }, 뺀다
      // const category = await this.categories.findOne(
      //   { slug },
      //   { relations: ['restaurants'] },
      // );
      //*****************************중요******************/
      //Category에 restaurants one to many가있다..(카테고리하나당
      // 모든 레스토랑 정보를 보고싶을때..)
      //그럴때는 relations을 써서 같이 찾아줘야 같은 카테고리의
      //레스토랑 정보를 그래프큐엘에서 가져올수있음!!
      //select slug, restaurants where ~~~
      //정모르겠으면 유저서비스에서 verifyEmail봐라
      //['restaurants'] 이름은 category entity의 oneToMany의
      //이름이랑 같아야 load하여 레스토랑 정보를 가져옴!!
      //**************************************************/
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      //여기서 같은 카테고리 300개 를 가져오지만 25개만 가져온다라는뜻!
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        order: {
          isPromoted: 'DESC',
        },
        take: 12,
        //첫페이지는 스킵안해서 0*25 두번쨰는 1*25
        //25개를 스킵하고 보여줄것임!
        skip: (page - 1) * 12,
      });
      //여기에  BBQ카테고리면 스킵제외 25개만 넣어주는것임!
      // category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 12),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  //모든 레스토랑 보기!!!!
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      //findAndCount 배열을 리턴한다!
      //첫번쨰 인자로 레스토랑 정보를 다 담고있는 배열을주고
      //두번째 인자로 결과 카운트를 리턴함!
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 12,
        take: 12,
        order: {
          isPromoted: 'DESC',
        }, //프로모트가 true부터 보기!
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 12),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
        //레스토랑은 메뉴와 함께 찾아 져야한다!
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      //findAndCount 배열을 리턴한다!
      //첫번쨰 인자로 레스토랑 정보를 다 담고있는 배열을주고
      //두번째 인자로 결과 카운트를 리턴함!
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          // name: Like(`%${query}%`),
          //like는 비슷하면찾아주는것임! %붙은쪽방향뭐가 있던 무시!!
          //문제는 대문자 소문자 구분을 하기에...BBQ면 bbq로 못찾음!
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
          //위의 식은 외워야함.. name을 찾을때 저렇게함!
          //ILIKE는 대소문자 사용가능!
        },
        skip: (page - 1) * 12,
        take: 12,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 12),
      };
    } catch {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      //먼저 레스토랑을 찾는다!
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      //restaurant은 entity에서 owner ID 와 연결되어있다!
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      //레스토랑의 정보가 담긴 접시를 넣어줄것임!
      // const newRestaurant = this.restaurants.create(createRestaurantInput);
      // newRestaurant.owner = owner;
      //owner칸에 user정보를 넣어줘서 create하는것이랑 똑같다고 보면됨!
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  // async checkDishOwner(ownerId: number, dishId: number) {}

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
        // relations: ['restaurant'], 이걸해줘야 dish주인이
        //맞는지 아닌지 확인후 지울수 있게됨!
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      //주인이 아니면 지울수없음!
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  //이것은 findById보다 많은 정보를 줄것이다.. 저건 음식매뉴만 주는데
  //위에 보면암..메뉴랑만 엮어 놨음!!!
  // 여기는 더많은 음식정보보태서 줄것임!
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
}
// getAll(): Promise<Restaurant[]> {
//   //find는 async method 여서 promise를 써야함!
//   return this.restaurants.find();
//   //여기서 리턴이 실제로 db에 접근하는 방식을 작성하게 될것임!!
// }
// createRestaurant(
//   createRestaurantDto: CreateRestaurantDto,
// ): Promise<Restaurant> {
//   //promise타입이 restaurant임!!
//   const newRestaurant = this.restaurants.create(createRestaurantDto);
//   //자바스크립트에는 저장하지만 db에는 저장하는게 아님..create는..
//   //그래서 save해줘야함!! save는 promise를 리턴함!
//   return this.restaurants.save(newRestaurant);
// }

// updateRestaurant({ id, data }: UpdateRestaurantDto) {
//   return this.restaurants.update(id, { ...data });
//   //업데이트 하고싶은 id를 알려주고 data를 넣을것임!
//   //id말고 name도 될수있다!!
// }
//*************중요************** */
//1. 정리하자면 UpdateRestaurantDto 안에서 data인
//2. UpdateRestaurantInputType를 가져오고 그친구는
//3. CreateRestaurantDto partical(부분허용)을 가져오게되고!
//4. CreateRestaurantDto 는 Resturant entity를 사용하게되는데
//5. CreateRestaurantDto 는 OmitType으로 id를 불필요로 가져오게된다!
