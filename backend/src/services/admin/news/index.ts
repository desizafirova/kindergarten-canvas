import newsGetAllService from './news_get_all_service';
import newsGetOneService from './news_get_one_service';
import newsCreateService from './news_create_service';
import newsUpdateService from './news_update_service';
import newsDeleteService from './news_delete_service';

export default {
    getAll: newsGetAllService,
    getOne: newsGetOneService,
    create: newsCreateService,
    update: newsUpdateService,
    remove: newsDeleteService,
};
