import eventGetAllService from './event_get_all_service';
import eventGetOneService from './event_get_one_service';
import eventCreateService from './event_create_service';
import eventUpdateService from './event_update_service';
import eventDeleteService from './event_delete_service';

export default {
    getAll: eventGetAllService,
    getOne: eventGetOneService,
    create: eventCreateService,
    update: eventUpdateService,
    remove: eventDeleteService,
};
