/**
 * Registration Confirmation Service
 *
 * NOTE: Email verification is NOT supported in this project.
 * The simplified User schema does not include tokenOfRegisterConfirmation.
 * This service returns a 501 Not Implemented error.
 */

import httpMsg from '@utils/http_messages/http_msg';

const errorCod = 'ERROR_NOT_IMPLEMENTED';
const errorMsg = 'Email verification is not supported in this project.';

export default async (_data: any) => {
    // Email verification disabled - simplified User schema
    return httpMsg.http422(errorMsg, errorCod);
};
