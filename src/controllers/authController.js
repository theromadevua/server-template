import AuthService from "../services/authService.js";
import { clearTokenCookies, setTokenCookies } from "../utils/cookieUtils.js";

class AuthController {
    static async register(req, res) {
        try {
            const { user, tokens } = await AuthService.register(req.body);
            
            setTokenCookies(res, tokens);
            
            return res.json({ user });
        } catch (err) {
            return res.status(400).json({ msg: err.message });
        }
    }
    
    static async login(req, res) {
        try {
            const { user, tokens } = await AuthService.login(req.body);
            
            setTokenCookies(res, tokens);
            
            return res.json({ user });
        } catch (err) {
            return res.status(400).json({ msg: err.message });
        }
    }
    
    static async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const { user, tokens } = await AuthService.refresh(refreshToken);
            
            setTokenCookies(res, tokens);
            
            return res.json({ user });
        } catch (err) {
            return res.status(401).json({ msg: err.message });
        }
    }
    
    static async logout(req, res) {
        try {
            await AuthService.logout();
            
            clearTokenCookies(res);
            
            return res.json({ msg: "successful logout" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
}

export default AuthController;