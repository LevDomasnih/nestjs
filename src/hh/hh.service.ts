import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { API_URL } from './hh.constans';

@Injectable()
export class HhService {
	token: string

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.token = this.configService.get('HH_TOKEN') ?? ''
	}

	async getData(text: string) {
		this.httpService.get(API_URL.vacancies, {
			params: {
				text,
				clusters: true
			},
			headers: {
				'User-Agent': 'OwlTop/1.0 (Lev@gmail.com)',
				Authorization: 'Bearer ' + this.token
			}
		})
	}
}
