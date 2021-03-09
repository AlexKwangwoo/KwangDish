import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Category } from './entities/category.entity';

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
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      //오너를 알아서 넣어줄것임!!지금 로그인한사람..
      //사람들이 koreanBBQ 찾아도 korean-bbq처럼 나올수있게 통합 slug 를 만들자!
      const categoryName = createRestaurantInput.categoryName
        .trim() //앞뒤 빈칸이 없을것임!
        .toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-'); //빈칸에 다 - 넣겠음!
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        //없으면 만들어줄것임!
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
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
  }
}
