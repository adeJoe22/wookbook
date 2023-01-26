import request from 'supertest';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';

import app from '@src/app';
import { environmentConfig } from '@src/configs';
import Product from '@src/models/Product.model';
import User from '@src/models/User.model';
import Token from '@src/models/Token.model';
import {
  adminEmails,
  authorizationRoles,
  cloudinaryResponse,
  correctFilePath as localFilePath,
  productPayload,
  userPayload,
} from '@src/constants';

beforeAll((done) => {
  jest.setTimeout(60000);
  mongoose.connect(environmentConfig.TEST_ENV_MONGODB_CONNECTION_STRING as string, () => {
    done();
  });
});

afterAll(async () => {
  // await Token.deleteMany({});
  // await User.deleteMany({});
  mongoose.connection.db.dropDatabase(() => {});
  await mongoose.disconnect();
  await mongoose.connection.close();
  jest.clearAllMocks();
});

beforeEach(async () => {
  jest.setTimeout(60000);
  await Token.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

afterEach(async () => {
  await Token.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

describe('product', () => {
  /**
   * Testing get all products endpoint
   */
  describe('GET /api/v1/products', () => {
    describe('given no product in db', () => {
      it('should return empty array with a 200', async () => {
        request(app)
          .get('/api/v1/products')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            return expect(response.body.data).toMatchObject({
              totalDocs: 0,
              totalPages: 0,
              lastPage: 0,
              count: 0,
              currentPage: { page: 1, limit: 20 },
              products: [],
            });
          });
      });
    });

    describe('given added 2 product in db', () => {
      it('should return array of 2 product with a 200', async () => {
        cloudinary.v2.uploader.upload = jest.fn().mockResolvedValue(cloudinaryResponse);

        // create user
        const newUser = new User({
          ...userPayload,
        });

        await newUser.save();

        const newProduct = { ...productPayload, user: newUser?._id };
        await Product.insertMany([
          {
            ...newProduct,
          },
          {
            ...newProduct,
          },
        ]);

        request(app)
          .get('/api/v1/products')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.data).toMatchObject({
              totalDocs: 2,
            });
            expect(response?.body?.data?.products?.length).toBe(2);
            expect(response?.body?.data?.products[0].name).toMatch(productPayload.name);
          });
      });
    });
  });

  /**
   * Testing get single product endpoint
   */
  describe('GET /api/v1/products/:productId', () => {
    describe('given the product does not exist', () => {
      it('should return a 400 status', async () =>
        request(app)
          .get(`/api/v1/products/63a449d6f4cf592dedf5c60b`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: 'Bad Request',
              status: 400,
              stack: expect.any(String),
            });
          }));
    });

    describe('given invaild product id', () => {
      it('should return a 422 status', async () => {
        const productId = 'product-123';
        return request(app)
          .get(`/api/v1/products/${productId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(422)
          .then((response) =>
            expect(response.body).toMatchObject({
              data: null,
              success: false,
              error: true,
              message: expect.any(String),
              status: 422,
            })
          );
      });
    });

    describe('given the product does exist', () => {
      it('should return a 200 status and the product', async () => {
        // create user
        const newUser = new User({
          ...userPayload,
        });

        await newUser.save();

        // Login to get token and user id
        const logUser = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: userPayload.email, password: userPayload.password });

        // create product
        const newProduct = new Product({ ...productPayload, user: logUser?.body?.data?.user?._id });
        const response = await newProduct.save();

        //  pass the created  product it to this test
        const productId = response?._id;

        const finalResult = await request(app)
          .get(`/api/v1/products/${productId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(finalResult?.body?.data?.product).toMatchObject(productPayload);
      });
    });
  });
});
