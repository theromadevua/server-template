import TokenService from '../services/tokenService.js';

export default function authMiddleware(req, res, next) {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ msg: "not authorized" });
        }
        
        const decoded = TokenService.checkAccessToken(accessToken);
        req.user = { id: decoded.id };
        
        next();
    } catch (err) {
        return res.status(401).json({ msg: "not authorized" });
    }
}