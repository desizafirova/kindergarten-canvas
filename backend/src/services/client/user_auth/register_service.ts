/**
 * User Registration Service
 *
 * NOTE: Self-registration is NOT supported in this project.
 * Admin users are created via the seed script (npx prisma db seed).
 * This service returns a 501 Not Implemented error.
 *
 * The simplified User schema only supports:
 * - id, email, password, role, createdAt, updatedAt
 *
 * No registration tokens, email verification, or self-service account creation.
 */

import httpMsg from '@utils/http_messages/http_msg';

const errorCod = 'ERROR_NOT_IMPLEMENTED';
const errorMsg = 'Self-registration is not supported. Admin users are created via seed script.';

export default async (_data: any) => {
    // Self-registration disabled - admin users created via seed script
    return httpMsg.http422(errorMsg, errorCod);
};
