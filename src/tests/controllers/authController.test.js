import AuthController from '../../controllers/authController.js';
import AuthService from '../../services/authService.js';
import { setTokenCookies, clearTokenCookies } from '../../utils/cookieUtils.js';

jest.mock('../../services/authService.js');
jest.mock('../../utils/cookieUtils.js');

describe('AuthController', () => {
    let req, res;
    
    beforeEach(() => {
        req = {
            body: {},
            cookies: {}
        };
        
        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        
        jest.clearAllMocks();
    });
    
    describe('register', () => {
        it('should register user and set cookies', async () => {
            req.body = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            
            const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
            const mockTokens = {
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };
            
            AuthService.register.mockResolvedValueOnce({
                user: mockUser,
                tokens: mockTokens
            });
            
            await AuthController.register(req, res);
            
            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            
            expect(setTokenCookies).toHaveBeenCalledWith(res, mockTokens);
            
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });
        
        it('should handle errors', async () => {
            AuthService.register.mockRejectedValueOnce(new Error('Registration failed'));
            
            await AuthController.register(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Registration failed' });
            
            expect(setTokenCookies).not.toHaveBeenCalled();
        });
    });
    
    describe('login', () => {
        it('should login user and set cookies', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const mockUser = { id: 1, email: 'test@example.com' };
            const mockTokens = {
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            };
            
            AuthService.login.mockResolvedValueOnce({
                user: mockUser,
                tokens: mockTokens
            });
            
            await AuthController.login(req, res);
            
            expect(AuthService.login).toHaveBeenCalledWith(req.body);
            
            expect(setTokenCookies).toHaveBeenCalledWith(res, mockTokens);
            
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });
        
        it('should handle login errors', async () => {
            AuthService.login.mockRejectedValueOnce(new Error('Invalid credentials'));
            
            await AuthController.login(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
            
            expect(setTokenCookies).not.toHaveBeenCalled();
        });
    });
    
    describe('refresh', () => {
        it('should refresh tokens and set new cookies', async () => {
            req.cookies = {
                refreshToken: 'valid_refresh_token'
            };
            
            const mockUser = { id: 1, email: 'test@example.com' };
            const mockTokens = {
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token'
            };
            
            AuthService.refresh.mockResolvedValueOnce({
                user: mockUser,
                tokens: mockTokens
            });
            
            await AuthController.refresh(req, res);
            
            expect(AuthService.refresh).toHaveBeenCalledWith('valid_refresh_token');
            
            expect(setTokenCookies).toHaveBeenCalledWith(res, mockTokens);
            
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });
        
        it('should handle refresh errors', async () => {
            req.cookies = {
                refreshToken: 'invalid_refresh_token'
            };
            
            AuthService.refresh.mockRejectedValueOnce(new Error('Invalid token'));
            
            await AuthController.refresh(req, res);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid token' });
            
            expect(setTokenCookies).not.toHaveBeenCalled();
        });
    });
    
    describe('logout', () => {
        it('should logout user and clear cookies', async () => {
            AuthService.logout.mockResolvedValueOnce(true);
            
            await AuthController.logout(req, res);
            
            expect(AuthService.logout).toHaveBeenCalled();
            
            expect(clearTokenCookies).toHaveBeenCalledWith(res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'successful logout' });
        });
        
        it('should handle logout errors', async () => {
            AuthService.logout.mockRejectedValueOnce(new Error('Logout failed'));
            
            await AuthController.logout(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Logout failed' });
            
            expect(clearTokenCookies).not.toHaveBeenCalled();
        });
    });
});