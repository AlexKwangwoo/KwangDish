to start : npm run start:dev
to set before use the heroku
->open the cmd -> set HomeDrive=C:/Users/818396/AppData/Local/heroku
and then you can do heroku login
heroku git:remote -a kwang-eats-backend 해로쿠가서 볼수있음!
권한이 없어서 여기 터미널에서 실행이안된다! add 와 commit을 하고 헤로쿠에도 해줘야함!!
git push heroku master 이렇게!
set HomeDrive=C:/Users/818396/AppData/Local/heroku cmd에서 할려면 이거 매번 껐다킬때마다 쳐야하는데 그래서 bash에서 실행시키면 아무 문제없이 잘돌아감!

- 밑에꺼 모르겠으면 깃허브 백앤드 setup3번부분 바뀐거 체크해보자!!
- 페이먼트 다 컨트롤/ 해주고 app.module 4번까지 /풀어주고 유저 엔티티가서
- 2개 더 / 풀어줘야함!!
- https://blog.naver.com/batgirl1/222126972818 postgre와 헤로쿠 연결!!

- git push heroku master
- heroku logs --tail

# Nuber Eats

The Backend of Nuber Eats Clone

## User Model:

//id, createdAt, updateAt to everywhere

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Restaurant Model

- name
- category
- address
- coverImage

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant

- Edit Restaurant
- Delete Restaurant

- Create Dish
- Edit Dish
- Delete Dish

- Create Dish
- Edit Dish
- Delete Dish
- Orders CRUD
- Orders Subscription (Owner, Customer, Delivery)

- Payments (CRON)

- Orders Subscription:
- Pending Orders (Owner) (T: createOrder)
- Order Status (Customer, Delivery, Owner) (T: editOrder)
- Pending Pickup Order (Delivery)

## etc

//entities는 오브젝트 개념의 리턴타입을 말해준다!
// @ObjectType() 이건 그래프큐엘을 위한것
// @Entity() 이건 typeorm 디비를 위한것!!
// Entity란 디비에 저장되는 방식!
// InputType 데코레이터(@)를 통해 dto에서 자동으로 같이 업데이트
//되게 만듬.. 그다음 resolver 에
// @Args('input') createRestaurantDto: CreateRestaurantDto <- input 을 넣어야함!
// isAbstarct:ture해야 적용이됨!(확장시킨다고 보면됨!)

@Field((type) => Boolean, { nullable: true })
@Column({ default: true })
@IsOptional()
@IsBoolean()
isVegan: boolean;
//isOptional을 쓰면 값을 안줘도 자동으로 true 대입한다!
//@Field((type) => Boolean, { defaultValue: true })
// @Column({ default: true })
//field는 그래프큐엘을위한.. column은 디비를 위한 디폴트값임!!
//nullable도 쓸수있으나.. 이거는 아예값이 안들어가는거고
//defaultValue는 지정된값이.. 안쓰면 자동으로 넣어준다!

저장공간을 aws를 쓸것이다!
