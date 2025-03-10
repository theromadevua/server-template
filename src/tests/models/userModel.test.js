import User from '../../models/user.js';
import sequelize from '../../config/database.js';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
    expect(user.password).toBe('hashedPassword');
  });

  it('should hash the password when updating it', async () => {
    const user = await User.create({
      username: 'updateuser',
      email: 'update@example.com',
      password: 'initialpassword'
    });

    jest.clearAllMocks();

    user.password = 'newpassword';
    await user.save();

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 'salt');
  });

  it('should not hash the password when updating other fields', async () => {
    const user = await User.create({
      username: 'otherfields',
      email: 'other@example.com',
      password: 'secure123'
    });

    jest.clearAllMocks();

    user.username = 'updatedusername';
    await user.save();

    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('should correctly compare passwords', async () => {
    const user = await User.create({
      username: 'compareuser',
      email: 'compare@example.com',
      password: 'password123'
    });

    bcrypt.compare.mockResolvedValueOnce(true);
    
    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
    
    bcrypt.compare.mockResolvedValueOnce(false);
    
    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should enforce email validation', async () => {
    const invalidUserData = {
      username: 'invalidemail',
      email: 'notanemail',
      password: 'password123'
    };

    await expect(User.create(invalidUserData)).rejects.toThrow();
  });

  it('should enforce username uniqueness', async () => {
    await User.create({
      username: 'uniqueuser',
      email: 'unique1@example.com',
      password: 'password123'
    });

    const duplicateUserData = {
      username: 'uniqueuser', 
      email: 'unique2@example.com',
      password: 'password123'
    };

    await expect(User.create(duplicateUserData)).rejects.toThrow();
  });

  it('should enforce email uniqueness', async () => {
    await User.create({
      username: 'emailuser1',
      email: 'duplicate@example.com',
      password: 'password123'
    });

    const duplicateEmailData = {
      username: 'emailuser2',
      email: 'duplicate@example.com', 
      password: 'password123'
    };

    await expect(User.create(duplicateEmailData)).rejects.toThrow();
  });
});