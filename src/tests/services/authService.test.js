import User from '../../models/user.js';
import TokenService from '../../services/tokenService.js';
import AuthService from '../../services/authService.js';

jest.mock('../../models/user.js');
jest.mock('../../services/tokenService.js');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('register', () => {
        it('should register a new user and return tokens', async () => {
            User.findOne.mockResolvedValueOnce(null);
            
            const newUser = { id: 1, username: 'testuser', email: 'test@example.com' };
            User.create.mockResolvedValueOnce(newUser);
            
            TokenService.generateTokens.mockReturnValueOnce({
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            });
            
            const result = await AuthService.register({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
            
            expect(result).toEqual({
                user: newUser,
                tokens: {
                    accessToken: 'mock_access_token',
                    refreshToken: 'mock_refresh_token'
                }
            });
            
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(User.create).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(TokenService.generateTokens).toHaveBeenCalledWith(newUser);
        });
        
        it('should throw error if user already exists', async () => {
            User.findOne.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
            
            await expect(
                AuthService.register({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            ).rejects.toThrow('user already exists');
            
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(User.create).not.toHaveBeenCalled();
            expect(TokenService.generateTokens).not.toHaveBeenCalled();
        });
    });
    
    describe('login', () => {
        it('should login user and return tokens', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValueOnce(true)
            };
            
            User.findOne.mockResolvedValueOnce(mockUser);
            
            TokenService.generateTokens.mockReturnValueOnce({
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            });
            
            const result = await AuthService.login({
                email: 'test@example.com',
                password: 'password123'
            });
            
            expect(result).toEqual({
                user: mockUser,
                tokens: {
                    accessToken: 'mock_access_token',
                    refreshToken: 'mock_refresh_token'
                }
            });
            
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
            expect(TokenService.generateTokens).toHaveBeenCalledWith(mockUser);
        });
        
        it('should throw error for invalid credentials - user not found', async () => {
            User.findOne.mockResolvedValueOnce(null);
            
            await expect(
                AuthService.login({
                    email: 'wrong@example.com',
                    password: 'password123'
                })
            ).rejects.toThrow('invalid user data');
            
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'wrong@example.com' } });
            expect(TokenService.generateTokens).not.toHaveBeenCalled();
        });
        
        it('should throw error for invalid credentials - wrong password', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValueOnce(false)
            };
            
            User.findOne.mockResolvedValueOnce(mockUser);
            
            await expect(
                AuthService.login({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
            ).rejects.toThrow('invalid user data');
            
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
            expect(TokenService.generateTokens).not.toHaveBeenCalled();
        });
    });
    
    describe('refresh', () => {
        it('should refresh tokens when valid refresh token provided', async () => {
            TokenService.checkRefreshToken.mockReturnValueOnce({ id: 1 });
            
            const mockUser = { id: 1, email: 'test@example.com' };
            User.findOne.mockResolvedValueOnce(mockUser);
            
            TokenService.generateTokens.mockReturnValueOnce({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token'
            });
            
            const result = await AuthService.refresh('valid_refresh_token');
            
            expect(result).toEqual({
                user: mockUser,
                tokens: {
                    accessToken: 'new_access_token',
                    refreshToken: 'new_refresh_token'
                }
            });
            
            expect(TokenService.checkRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
            expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(TokenService.generateTokens).toHaveBeenCalledWith(mockUser);
        });
        
        it('should throw error when refresh token not provided', async () => {
            await expect(
                AuthService.refresh(null)
            ).rejects.toThrow('no token provided');
            
            expect(TokenService.checkRefreshToken).not.toHaveBeenCalled();
            expect(User.findOne).not.toHaveBeenCalled();
        });
        
        it('should throw error when user not found', async () => {
            TokenService.checkRefreshToken.mockReturnValueOnce({ id: 999 });
            User.findOne.mockResolvedValueOnce(null);
            
            await expect(
                AuthService.refresh('valid_refresh_token')
            ).rejects.toThrow('user is not found');
            
            expect(TokenService.checkRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
            expect(User.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(TokenService.generateTokens).not.toHaveBeenCalled();
        });
        
        it('should throw error when token verification fails', async () => {
            TokenService.checkRefreshToken.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });
            
            await expect(
                AuthService.refresh('invalid_refresh_token')
            ).rejects.toThrow('Invalid token');
            
            expect(TokenService.checkRefreshToken).toHaveBeenCalledWith('invalid_refresh_token');
            expect(User.findOne).not.toHaveBeenCalled();
        });
    });
    
    describe('logout', () => {
        it('should return true', async () => {
            const result = await AuthService.logout();
            expect(result).toBe(true);
        });
    });
});