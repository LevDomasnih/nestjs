import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
	Post, UseGuards,
	UsePipes, ValidationPipe,
} from '@nestjs/common';
import {FindTopPageDto} from './dto/find-top-page.dto';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { TopPageService } from './top-page.service';
import { PAGE_NOT_FOUND_ERROR } from './top-page.constans';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { HhService } from '../hh/hh.service';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Controller('top-page')
export class TopPageController {
	constructor(
		private readonly topPageService: TopPageService,
		private readonly hhService: HhService,
		private readonly schedulerRegistry: SchedulerRegistry,
	) { }

	@UseGuards(JwtAuthGuard)
	@Post('create')
	async create(@Body() dto: CreateTopPageDto) {
		return this.topPageService.create(dto)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async get(@Param('id', IdValidationPipe) id: string) {
		const topPage = await this.topPageService.findById(id)
		if (!topPage) {
			throw new NotFoundException(PAGE_NOT_FOUND_ERROR)
		}
		return topPage
	}

	@Get('byAlias/:alias')
	async getByAlias(@Param('alias') id: string) {
		const topPageByAlias = await this.topPageService.findByAlias(id)
		if (!topPageByAlias) {
			throw new NotFoundException(PAGE_NOT_FOUND_ERROR)
		}
		return topPageByAlias
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		const topPageDelete = await this.topPageService.deleteById(id)
		if (!topPageDelete) {
			throw new NotFoundException(PAGE_NOT_FOUND_ERROR)
		}
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async patch(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateTopPageDto) {
		const topPageUpdate = await this.topPageService.updateById(id, dto)
		if (!topPageUpdate) {
			throw new NotFoundException(PAGE_NOT_FOUND_ERROR)
		}
		return topPageUpdate
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('find')
	async find(@Body() dto: FindTopPageDto) {
		return this.topPageService.findByCategory(dto.firstCategory)
	}

	@Get('textSearch/:text')
	async textSearch(@Param('text') text: string) {
		return this.topPageService.findByText(text)
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {name: 'test'})
	async test() {
		const job = this.schedulerRegistry.getCronJob('test')
		const data = await this.topPageService.findForHhUpdate(new Date())
		for (const page of data) {
			const hhData = await this.hhService.getData(page.category)
			page.hh = hhData
			// @ts-ignore
			await this.topPageService.updateById(page._id, page)
		}
	}
}
