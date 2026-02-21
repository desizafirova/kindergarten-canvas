/**
 * Password Reset Service
 *
 * NOTE: Token-based password reset is NOT supported in this project.
 * The simplified User schema does not include tokenOfResetPassword.
 * This service returns a 501 Not Implemented error.
 *
 * To reset an admin password, update the DEFAULT_ADMIN_PASSWORD env var
 * and re-run the seed script, or manually update via Prisma Studio.
 */

import httpMsg from '@utils/http_messages/http_msg';

const errorCod = 'ERROR_NOT_IMPLEMENTED';
const errorMsg = 'Token-based password reset is not supported. Contact system administrator.';

export default async (_data: any) => {
    // Password reset via token disabled - simplified User schema
    return httpMsg.http422(errorMsg, errorCod);
};
