import { ITelegramOptions } from '../src/telegram/telegram.interface';

export const getTelegramConfig = (): ITelegramOptions => {
	return {
		token: '',
		chatId: ''
	}
}