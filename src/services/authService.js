import User from "../models/user.js";
import TokenService from "./tokenService.js";

class AuthService {
    static async register({ username, email, password }) {
        let user = await User.findOne({ where: { email } });
        if (user) {
            throw new Error("user already exists");
        }
        
        user = await User.create({ username, email, password });
        const tokens = TokenService.generateTokens(user);
        
        return { user, tokens };
    }
    
    static async login({ email, password }) {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error("invalid user data");
        }
        
        const tokens = TokenService.generateTokens(user);
        
        return { user, tokens };
    }
    
    static async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error("no token provided");
        }
        
        const decoded = TokenService.checkRefreshToken(refreshToken);
        const user = await User.findOne({ where: { id: decoded.id } });
        
        if (!user) {
            throw new Error("user is not found");
        }
        
        const tokens = TokenService.generateTokens(user);
        
        return { user, tokens };
    }
    
    static async logout() {
        return true;
    }
}

export default AuthService;