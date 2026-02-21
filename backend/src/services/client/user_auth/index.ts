import login from './login_service';
import logout from './logout_service';
import refresh from './refresh_token_service';
import register from './register_service';
import registerConfirm from './register_confirm_service';
import forgotPasswordRequest from './request_password_service';
import forgotPasswordReset from './reset_password_service';

export default {
    login,
    logout,
    refresh,
    register,
    registerConfirm,
    forgotPasswordRequest,
    forgotPasswordReset,
};
