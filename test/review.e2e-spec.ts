import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { Types, disconnect } from 'mongoose';
import { AppModule } from '../src/app.module';
import { REVIEW_NOT_FOUND } from '../src/review/review.constans';

const productId = new Types.ObjectId().toString()

const testDto: CreateReviewDto = {
	name: 'Test',
	title: 'Title',
	description: 'Description',
	ration: 5,
	productId
}

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/review/create (POST - success)',  () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.send(testDto)
			.expect(201)
			.then(({body}: request.Response) => {
				createdId = body._id
				expect(createdId).toBeDefined()
			})
	});

	it('/review/byProduct/:productId (GET - success)',  () => {
		return request(app.getHttpServer())
			.get('/review/byProduct/' + productId)
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.length).toBe(1)
			})
	});

	it('/review/byProduct/:productId (GET - fail)',  () => {
		return request(app.getHttpServer())
			.get('/review/byProduct/' + new Types.ObjectId().toString())
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.length).toBe(0)
			})
	});

	it('/review/:id (DELETE - success)', () => {
		return request(app.getHttpServer())
			.delete('/review/' + createdId)
			.expect(200)
	});

	it('/review/:id (DELETE - fail)', () => {
		return request(app.getHttpServer())
			.delete('/review/' + new Types.ObjectId().toString())
			.expect(404, {
				statusCode: 404,
				message: REVIEW_NOT_FOUND
			})
	});

	afterAll(() => {
		disconnect()
	})
});