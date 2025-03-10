import jwt from 'jsonwebtoken';
import TokenService from '../../services/tokenService';

jest.mock('jsonwebtoken');

describe('TokenService', () => {
    const originalEnv = process.env;
    
    beforeEach(() => {
        process.env.JWT_ACCESS_SECRET = 'test_access_secret';
        process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
        
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        process.env = originalEnv;
    });
    
    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            jwt.sign
                .mockReturnValueOnce('mock_access_token')
                .mockReturnValueOnce('mock_refresh_token');
                
            const user = { id: 1 };
            const tokens = TokenService.generateTokens(user);
            
            expect(tokens).toEqual({
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            });
            
            expect(jwt.sign).toHaveBeenCalledTimes(2);
            
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1 },
                'test_access_secret',
                { expiresIn: '15m' }
            );
            
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1 },
                'test_refresh_secret',
                { expiresIn: '30d' }
            );
        });
    });
    
    describe('checkAccessToken', () => {
        it('should verify access token', () => {
            jwt.verify.mockReturnValueOnce({ id: 1 });
            
            const result = TokenService.checkAccessToken('test_token');
            
            expect(result).toEqual({ id: 1 });
            expect(jwt.verify).toHaveBeenCalledWith('test_token', 'test_access_secret');
        });
        
        it('should throw error for invalid token', () => {
            jwt.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });
            
            expect(() => {
                TokenService.checkAccessToken('invalid_token');
            }).toThrow();
            
            expect(jwt.verify).toHaveBeenCalledWith('invalid_token', 'test_access_secret');
        });
    });
    
    describe('checkRefreshToken', () => {
        it('should verify refresh token', () => {
            jwt.verify.mockReturnValueOnce({ id: 1 });
            
            const result = TokenService.checkRefreshToken('test_token');
            
            expect(result).toEqual({ id: 1 });
            expect(jwt.verify).toHaveBeenCalledWith('test_token', 'test_refresh_secret');
        });
        
        it('should throw error for invalid token', () => {
            jwt.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });
            
            expect(() => {
                TokenService.checkRefreshToken('invalid_token');
            }).toThrow();
            
            expect(jwt.verify).toHaveBeenCalledWith('invalid_token', 'test_refresh_secret');
        });
    });
});