import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import session from 'express-session';
import passport from 'passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseConfig } from 'src/config/configuration';
import { SequelizeConfigService } from 'src/config/sequelizeConfig.service';
import { User } from 'src/users/users.model';
import { AuthModule } from 'src/auth/auth.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';
import { BoilerParts } from 'src/boiler-parts/boiler-parts.model';
import { UsersService } from 'src/users/users.service';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module';

const mockedUser = {
  username: 'test123',
  email: 'test123@gmail.com',
  password: 'test123',
};

describe('Shopping Cart Controller', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let testPart1: any;
  let testCart: any;

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        ShoppingCartModule,
        BoilerPartsModule,
        AuthModule,
      ],
    }).compile();

    usersService = testModule.get<UsersService>(UsersService);

    app = testModule.createNestApplication();

    app.use(
      session({
        secret: 'keyword',
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());

    await app.init();
  });

  beforeEach(async () => {
    // --- создаём пользователя ---
    const hashedPassword = await bcrypt.hash(mockedUser.password, 10);
    const user = await User.create({
      username: mockedUser.username,
      email: mockedUser.email,
      password: hashedPassword,
    });

    // --- создаём тестовую часть ---
    testPart1 = await BoilerParts.create({
      boiler_manufacturer: 'Test Boiler 1',
      parts_manufacturer: 'Test Parts 1',
      vendor_code: 'TEST-001',
      name: 'Test Part A',
      description: 'Test Description A',
      price: 100,
      images: JSON.stringify(['test1.jpg']),
      in_stock: 10,
      bestseller: true,
      new: false,
      popularity: 5,
      compatibility: 'Universal',
    });

    testPart1 = testPart1.toJSON ? testPart1.toJSON() : testPart1;

    // --- создаём корзину ---
    testCart = await ShoppingCart.create({
      userId: user.id,
      partId: testPart1.id,
      boiler_manufacturer: testPart1.boiler_manufacturer,
      parts_manufacturer: testPart1.parts_manufacturer,
      price: testPart1.price,
      in_stock: testPart1.in_stock,
      image: JSON.parse(testPart1.images)[0],
      name: testPart1.name,
      total_price: testPart1.price,
      count: 1,
    } as any);
  });

  afterEach(async () => {
    await ShoppingCart.destroy({ where: { partId: testPart1.id } });
    await User.destroy({ where: { username: mockedUser.username } });
    await BoilerParts.destroy({ where: { vendor_code: 'TEST-001' } });
  });

  it('should add cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user?.id || 1}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: testCart.id,
          userId: user?.id,
          partId: testPart1.id,
          boiler_manufacturer: testPart1.boiler_manufacturer,
          price: testPart1.price,
          parts_manufacturer: testPart1.parts_manufacturer,
          name: testPart1.name,
          image: JSON.parse(testPart1.images)[0],
          count: 1,
          total_price: testPart1.price,
          in_stock: testPart1.in_stock,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );
  });

  it('should get all cart items', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user?.id || 1}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.find((item) => item.partId === testPart1.id)).toEqual(
      expect.objectContaining({
        id: testCart.id,
        userId: user?.id,
        partId: testPart1.id,
        boiler_manufacturer: testPart1.boiler_manufacturer,
        price: testPart1.price,
        parts_manufacturer: testPart1.parts_manufacturer,
        name: testPart1.name,
        image: JSON.parse(testPart1.images)[0],
        count: 1,
        total_price: testPart1.price,
        in_stock: testPart1.in_stock,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('should update count of cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .patch(`/shopping-cart/count/${testPart1.id}`)
      .send({ count: 3 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual({ count: 3 });
  });

  it('should update total price of cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .patch(`/shopping-cart/total-price/${testPart1.id}`)
      .send({ total_price: testPart1.price * 2 })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual({ total_price: testPart1.price * 2 });
  });

  it('should delete one cart item', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    await request(app.getHttpServer())
      .delete(`/shopping-cart/one/${testPart1.id}`)
      .set('Cookie', login.headers['set-cookie']);

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user?.id || 1}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(
      response.body.find((item) => item.partId === testPart1.id),
    ).toBeUndefined();
  });

  it('should delete all cart items', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const user = await usersService.findOne({
      where: { username: mockedUser.username },
    });

    await request(app.getHttpServer())
      .delete(`/shopping-cart/all/${user?.id || 1}`)
      .set('Cookie', login.headers['set-cookie']);

    const response = await request(app.getHttpServer())
      .get(`/shopping-cart/${user?.id || 1}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toStrictEqual([]);
  });
});
