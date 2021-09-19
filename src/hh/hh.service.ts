import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { API_URL } from './hh.constans';
import { HhResponse } from './hh.models';

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
		try {
			// @ts-ignore
			const { data } = await this.httpService.get<HhResponse>(API_URL.vacancies, {
				params: {
					text,
					clusters: true
				},
				headers: {
					'User-Agent': 'OwlTop/1.0 (Lev@gmail.com)',
					Authorization: 'Bearer ' + this.token
				}
			}).toPromise()
		} catch (e) {
			Logger.error(e)
		}

	}
}
