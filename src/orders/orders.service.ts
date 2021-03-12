import { OrderItem } from './entities/order-item.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';

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
    // const restaurant = await this.restaurants.findOne(restaurantId);
    // if (!restaurant) {
    //   return {
    //     ok: false,
    //     error: 'Restaurant not found',
    //   };
    // }
    // //item부분의 옵션은 json이라 검사하지않음..
    // // items.forEach(async item => { 이렇게해서 아이탭 옵션들을
    // //봤는데 return이 되지않아 for of 로 바꿈!!

    // for (const item of items) {
    //   const dish = await this.dishes.findOne(item.dishId);
    //   if (!dish) {
    // abort this whole things.
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      //OrderItem[]의배열의 타입을가진 orderItems에 빈배열을 부여함!
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found.',
          };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              //extra가 없으면 안에서 또 선택이있어 그안에 extra있는지보자!

              //choices 속성 하나하나가 optionChoice라 생각하면 그 초이스들의
              //이름들이 같은걸 골라낼것이다!
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              //dishOption.extra가 없으면 안에서 또 선택이있어
              //그안에 extra있는지보자! 그안에 extra가 있다면!! 또 파이널에 더해준다!
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }
        // orderFinalPrice첨엔 0시작 계속 아이탬들의 옵션가격들이 저장됨!
        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        //여기는 하나의 아이탬이 저장됨!
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      //여기는 모든아이탬과 그아이탬들의 옵션가격이 다더해진
      //최종 오더가 저정될것임!!
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
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
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
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

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        //주문을 찾는것임!
        orders = await this.orders.find({
          where: {
            customer: user,
            //status가 있을때 orders에 넣겠다..undefined면 안넣음!!
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          //오너는 레스토랑이 많다!
          relations: ['orders'],
        });
        //오너는 여러개 가지기에... 모든 레스토랑을 뒤져서 오더있는거만 뽑는다!
        //하나를 꺼낸다..즉.. 레스토랑 안에 오더가 있는데 flat을 쓰면 레스토랑이
        //벗겨지고 오더만 나오게 된다!
        // Order {
        //   id: 1,
        //   total: 19,
        //   status: 'Pending'
        // },
        // [][] 2차원 어레이인데 flat해주면 []마지막 차원을 리턴한다..order만!
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        // console.log(orders);
        if (status) {
          //유저가 보고싶은 status만 보여주기!!
          //map은 새로운 배열을 생성, filter는 조건 충족못하면 제거!
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      //지금 사람이 client인데.. 오더주문산 customerID가 아니면 안보여줌!
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
        // relations: ['restaurant'],넣어주는이유가 order의 restarant를찾고
        // restaurant의 오너를 찾기위해서!! load해줘야한다!! load하면 얘가
        //또 연결되어있는 owner를 가져올수있다!! 하지만
        // load하기싫으면 order entity에서
        // @Field((type) => User, { nullable: true })
        // @ManyToOne((type) => User, (user) => user.orders, {
        //   onDelete: 'SET NULL',
        //   nullable: true,
        // })
        // customer?: User;
        //-----------------이부분을 해줘야한다!! 그래야 load안하고 id로 접근가능!
        // @RelationId((order: Order) => order.customer)
        // customerId: number;
        //----이렇게하면 깊숙히 가져오지는못한다! 11.13 9분에있음!
        // customerId 이거는 order entity에서 가져올수있다
        // driverId
        // restaurant.ownerId 이거는 restaurant entity에서 또 하나 더 가서가져옴!!
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        //이 오더가  니랑 관계없으면 넌 못봐!
        return {
          ok: false,
          error: 'You cant see that',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
        //여기서 restaurant 로드이유는 위에랑 똑같다!
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "Can't see this.",
        };
      }
      let canEdit = true;
      //오직 레스토랑과 딜리버리만 오더를 바꿀수있다!
      // 이것은 딜리버리는 바꿀수있음!
      // PickedUp = 'PickedUp',
      // Delivered = 'Delivered',
      // 이것은 오너만 바꿀수있음!
      // Cooking = 'Cooking',
      // Cooked = 'Cooked',
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      //오너는 바꿀수있음!!
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
          //고칠려는 상태가 두상태가 아니면 수정못함!
        }
      }
      //드라이버가 바꿀수있음!!
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.orders.save([
        {
          id: orderId,
          status,
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit order.',
      };
    }
  }
}
//dish.option : 이건 db에 저장된 owner가 정한 음식 옵션
//item.option : 이건 손님이 정한 음식 옵션!
// console.log(`Dish price: ${dish.price}`);
// for (const itemOption of item.options) {
//   const dishOption = dish.options.find(
//     (dishOption) => dishOption.name === itemOption.name,
//   );
//   if (dishOption) {
//     //하나하나의 옵션의 extra를 찾아냄
//     if (dishOption.extra) {
//       console.log(`$USD + ${dishOption.extra}`);
//     } else {
//       //chovice의 속성 하나하나가 optionChoice라 생각하면 그 초이스들의
//       //이름들이 같은걸 골라낼것이다!
//       const dishOptionChoice = dishOption.choices.find(
//         (optionChoice) => optionChoice.name === itemOption.choice,
//       );
//       if (dishOptionChoice) {
//         if (dishOptionChoice.extra) {
//           console.log(`$USD + ${dishOptionChoice.extra}`);
