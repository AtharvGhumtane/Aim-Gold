import { Router } from 'express';
import { 
    acceptConnectionRequest, 
    downloadProfile, 
    getAllUserProfile, 
    getMyConnectionRequests, 
    getUserProfileAndUserBasedOnUsername, 
    register, 
    whatAreMyConnections,
    sendConnectionRequest  // ✅ CHANGED: Import the correct function name
} from '../controllers/user.controller.js';
import { login } from '../controllers/user.controller.js';
import multer from 'multer';
import { uploadProfilePicture } from '../controllers/user.controller.js';
import { updateUserProfile } from '../controllers/user.controller.js';
import { getUserAndProfile } from '../controllers/user.controller.js';
import { updateProfileData } from '../controllers/user.controller.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname)
    }
});

const upload = multer({storage:storage});

router.route('/update_profile_picture').post(upload.single('profilePicture'),uploadProfilePicture);

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);
router.route('/update_profile_data').post(updateProfileData);
router.route('/user/get_all_users').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadProfile);
router.route('/user/send_connection_request').post(sendConnectionRequest); // ✅ CHANGED: Use correct function name
router.route('/user/getConnectionRequests').get(getMyConnectionRequests);
router.route('/user/user_connection_requests').get(whatAreMyConnections);
router.route('/user/accept_connection_request').post(acceptConnectionRequest);
router.route('/user/get_profile_based_on_username').get(getUserProfileAndUserBasedOnUsername)

export default router;