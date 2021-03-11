import { OrderItem } from './entities/order-item.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async crateOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }
    //item부분의 옵션은 json이라 검사하지않음..
    items.forEach(async (item) => {
      const dish = await this.dishes.findOne(item.dishId);
      if (!dish) {
        // abort this whole things.
      }
      await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        }),
        //밑의 내용이 item.options의 내용이다!!
        // [Object: null prototype] {
        //   dishId: 3,
        //   options: [
        //     [Object: null prototype] { name: 'Spice Level', choice: 'Kill me' },
        //     [Object: null prototype] { name: 'Spice Level', choice: 'love me' }
        //   ]
        // }
        //계산을 넣어줘야함 option값에대한..
      );
    });
    /*
    //주문 만들기!
    const order = await this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      }),
    );
    console.log(order);
   */
  }
}
