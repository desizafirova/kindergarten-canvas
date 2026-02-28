import teacherGetAllService from './teacher_get_all_service';
import teacherGetOneService from './teacher_get_one_service';
import teacherCreateService from './teacher_create_service';
import teacherUpdateService from './teacher_update_service';
import teacherDeleteService from './teacher_delete_service';

export default {
    getAll: teacherGetAllService,
    getOne: teacherGetOneService,
    create: teacherCreateService,
    update: teacherUpdateService,
    remove: teacherDeleteService,
};
