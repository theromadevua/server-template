import authMiddleware from '../../middleware/auth.js';
import TokenService from '../../services/tokenService.js';

const mockRequest = (cookies = {}) => ({
    cookies,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('authMiddleware', () => {
    it('should approve user with accessToken', () => {
        const req = mockRequest({ accessToken: 'validToken' });
        const res = mockResponse();
        const next = jest.fn();

        jest.spyOn(TokenService, 'checkAccessToken').mockReturnValue({ id: 1 });

        authMiddleware(req, res, next);

        expect(TokenService.checkAccessToken).toHaveBeenCalledWith('validToken');
        expect(req.user).toEqual({ id: 1 });
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if accessToken is missing', () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "not authorized" });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if accessToken is invalid', () => {
        const req = mockRequest({ accessToken: 'invalidToken' });
        const res = mockResponse();
        const next = jest.fn();

        jest.spyOn(TokenService, 'checkAccessToken').mockImplementation(() => {
            throw new Error();
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ msg: "not authorized" });
        expect(next).not.toHaveBeenCalled();
    });
});
