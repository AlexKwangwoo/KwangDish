import { RestaurantResolver } from './restaurants.resolver';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { Category } from './entities/category.entity';

@Module({
  //forFeature은 특정 feature를 import할수있게 해준다
  //여기서 feature 은 restaurant entity다!
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  //1. 위에서 repository를 가져오고
  providers: [RestaurantResolver, RestaurantService],
  //2. service내용(db에 리턴할것)을 resolver에 넣었음!!
})
export class RestaurantsModule {}
