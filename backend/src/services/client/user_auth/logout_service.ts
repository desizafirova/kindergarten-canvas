import httpMsg from '@utils/http_messages/http_msg';

interface LogoutData {
    refreshToken?: string;
}

export default async (_data: LogoutData) => {
    // In a stateless JWT implementation, logout is handled client-side
    // by discarding the tokens. For a more robust implementation,
    // you would store refresh tokens in a database and invalidate them here.
    //
    // The client is expected to:
    // 1. Clear the access token from memory/storage
    // 2. Clear the refresh token from memory/storage
    //
    // This endpoint confirms the logout was successful.
    return httpMsg.http200({ message: 'Logged out successfully' });
};
