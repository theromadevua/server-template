export function setTokenCookies(res, tokens) {
    res.cookie('accessToken', tokens.accessToken, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
}

export function clearTokenCookies(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
}