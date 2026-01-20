import { BoilerParts } from 'src/boiler-parts/boiler-parts.model';
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

const mockedUser = {
  username: 'test123',
  email: 'test123@gmail.com',
  password: 'test123',
};

describe('Boiler Parts Controller', () => {
  let app: INestApplication;
  let testPart1: any;
  let testPart2: any;

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useClass: SequelizeConfigService,
        }),
        ConfigModule.forRoot({ load: [databaseConfig] }),
        BoilerPartsModule,
        AuthModule,
      ],
    }).compile();

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
    const user = new User();
    const hashedPassword = await bcrypt.hash(mockedUser.password, 10);
    user.username = mockedUser.username;
    user.password = hashedPassword;
    user.email = mockedUser.email;
    await user.save();

    testPart1 = await BoilerParts.create({
      boiler_manufacturer: 'Test Boiler 1',
      parts_manufacturer: 'Test Parts 1',
      vendor_code: 'TEST-001',
      name: 'Test Part A',
      description: 'Test Description A',
      price: 100,
      images: 'test1.jpg',
      in_stock: 10,
      bestseller: true,
      new: false,
      popularity: 5,
      compatibility: 'Universal',
    });

    testPart2 = await BoilerParts.create({
      boiler_manufacturer: 'Test Boiler 2',
      parts_manufacturer: 'Test Parts 2',
      vendor_code: 'TEST-002',
      name: 'Test Part B',
      description: 'Test Description B',
      price: 150,
      images: 'test2.jpg',
      in_stock: 20,
      bestseller: false,
      new: true,
      popularity: 10,
      compatibility: 'Universal',
    });
  });

  afterEach(async () => {
    await User.destroy({ where: { username: mockedUser.username } });
    await BoilerParts.destroy({
      where: { vendor_code: ['TEST-001', 'TEST-002'] },
    });
  });

  it('should get one part', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .get(`/boiler-parts/find/${testPart1.id}`)
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: testPart1.id,
        price: expect.any(Number),
        boiler_manufacturer: expect.any(String),
        parts_manufacturer: expect.any(String),
        vendor_code: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        images: expect.any(String),
        in_stock: expect.any(Number),
        bestseller: expect.any(Boolean),
        new: expect.any(Boolean),
        popularity: expect.any(Number),
        compatibility: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('should get bestsellers', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .get('/boiler-parts/bestsellers')
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: testPart1.id,
          bestseller: true,
        }),
      ]),
    );
  });

  it('should get new parts', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .get('/boiler-parts/new')
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: testPart2.id,
          new: true,
        }),
      ]),
    );
  });

  it('should search by string', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const response = await request(app.getHttpServer())
      .post('/boiler-parts/search')
      .send({ search: 'Test Part' })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body.rows.length).toBeGreaterThanOrEqual(2);
    response.body.rows.forEach((element) => {
      expect(element.name).toMatch(/Test Part/);
    });
  });

  it('should get by name', async () => {
    const login = await request(app.getHttpServer())
      .post('/users/login')
      .send({ username: mockedUser.username, password: mockedUser.password });

    const testPart1Name = testPart1.get('name');
    const response = await request(app.getHttpServer())
      .post('/boiler-parts/name')
      .send({ name: testPart1Name })
      .set('Cookie', login.headers['set-cookie']);

    expect(response.body).toEqual(
      expect.objectContaining({ id: testPart1.id, name: testPart1Name }),
    );
  });
});
