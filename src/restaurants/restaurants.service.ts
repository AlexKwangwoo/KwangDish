import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

//service에서 만들어주고 resolver에서 적용시킴!!

@Injectable()
export class RestaurantService {
  constructor(
    //밑에껄 inject하기위해 restaurant module에서
    // 가져온것임!! imports: [TypeOrmModule.forFeature([Restaurant])],
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    //find는 async method 여서 promise를 써야함!
    return this.restaurants.find();
    //여기서 리턴이 실제로 db에 접근하는 방식을 작성하게 될것임!!
  }
  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    //promise타입이 restaurant임!!
    const newRestaurant = this.restaurants.create(createRestaurantDto);
    //자바스크립트에는 저장하지만 db에는 저장하는게 아님..create는..
    //그래서 save해줘야함!! save는 promise를 리턴함!
    return this.restaurants.save(newRestaurant);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    return this.restaurants.update(id, { ...data });
    //업데이트 하고싶은 id를 알려주고 data를 넣을것임!
    //id말고 name도 될수있다!!
  }
  //*************중요************** */
  //1. 정리하자면 UpdateRestaurantDto 안에서 data인
  //2. UpdateRestaurantInputType를 가져오고 그친구는
  //3. CreateRestaurantDto partical(부분허용)을 가져오게되고!
  //4. CreateRestaurantDto 는 Resturant entity를 사용하게되는데
  //5. CreateRestaurantDto 는 OmitType으로 id를 불필요로 가져오게된다!
}
