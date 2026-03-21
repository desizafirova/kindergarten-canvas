import getAll from './gallery_get_all_service';
import getOne from './gallery_get_one_service';
import create from './gallery_create_service';
import update from './gallery_update_service';
import remove from './gallery_delete_service';
import addImage from './gallery_image_upload_service';
import removeImage from './gallery_image_delete_service';
import reorderImages from './gallery_image_reorder_service';

export default { getAll, getOne, create, update, remove, addImage, removeImage, reorderImages };
