import jwt from 'jsonwebtoken';

class TokenService {
    static generateTokens(user) {
        const accessToken = jwt.sign(
            { id: user.id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );
        
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '30d' }
        );
        
        return { accessToken, refreshToken };
    }
    
    static checkAccessToken(token) {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    }
    
    static checkRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
}

export default TokenService;