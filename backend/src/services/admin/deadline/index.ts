import deadlineGetAllService from './deadline_get_all_service';
import deadlineGetOneService from './deadline_get_one_service';
import deadlineCreateService from './deadline_create_service';
import deadlineUpdateService from './deadline_update_service';
import deadlineDeleteService from './deadline_delete_service';

export default {
    getAll: deadlineGetAllService,
    getOne: deadlineGetOneService,
    create: deadlineCreateService,
    update: deadlineUpdateService,
    remove: deadlineDeleteService,
};
