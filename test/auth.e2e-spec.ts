import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from '../src/auth/auth.constans';
import { disconnect } from 'mongoose';

const loginDto: AuthDto = {
	login: 'testuser@.ru',
	password: '1234'
}

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/auth/login (POST - success)',  () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send(loginDto)
			.expect(200)
			.then(({body}: request.Response) => {
				expect(body.access_token).toBeDefined()
			})
	});

	it('/auth/login (POST - wrong password)',  () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...loginDto, password: 'wrongpass'})
			.expect(401, {
				statusCode: 401,
				message: WRONG_PASSWORD_ERROR,
				error: 'Unauthorized'
			})
	});

	it('/auth/login (POST - not found email)',  () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...loginDto, login: 'wrong@mail.ru'})
			.expect(401, {
				statusCode: 401,
				message: USER_NOT_FOUND_ERROR,
				error: 'Unauthorized'
			})
	});

	afterAll(() => {
		disconnect()
	})
})