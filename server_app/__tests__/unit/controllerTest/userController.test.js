const User = require('../../../API/Models/User');
const userController = require('../../../API/Controllers/userController');

jest.mock('../../../API/Models/User');

describe('User Controller - Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { _id: 'admin123', role: 'admin' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return all users without passwords', async() => {
            const mockUsers = [
                { _id: '1', name: 'User 1', email: 'user1@test.com', role: 'user' },
                { _id: '2', name: 'User 2', email: 'user2@test.com', role: 'user' }
            ];

            const mockFind = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockUsers)
            };

            User.find = jest.fn().mockReturnValue(mockFind);

            await userController.getUsers(req, res, next);

            expect(User.find).toHaveBeenCalledWith({});
            expect(mockFind.select).toHaveBeenCalledWith('-password');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockUsers
            });
        });

        it('should filter users by role', async() => {
            req.query.role = 'restaurant';

            const mockFind = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            User.find = jest.fn().mockReturnValue(mockFind);

            await userController.getUsers(req, res, next);

            expect(User.find).toHaveBeenCalledWith({ role: 'restaurant' });
        });

        it('should search users by name or email', async() => {
            req.query.search = 'john';

            const mockFind = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            User.find = jest.fn().mockReturnValue(mockFind);

            await userController.getUsers(req, res, next);

            expect(User.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: 'john', $options: 'i' } },
                    { email: { $regex: 'john', $options: 'i' } }
                ]
            });
        });
    });

    describe('getUserById', () => {
        it('should return user by ID without password', async() => {
            req.params.id = 'user123';

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@test.com'
            };

            User.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await userController.getUserById(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        it('should return 404 if user not found', async() => {
            req.params.id = 'invalid123';

            User.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await userController.getUserById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async() => {
            req.params.id = 'user123';
            req.body = { name: 'Updated Name', email: 'updated@test.com' };

            const mockUser = { _id: 'user123', name: 'Old Name' };
            const updatedUser = { _id: 'user123', name: 'Updated Name', email: 'updated@test.com' };

            User.findById = jest.fn().mockResolvedValue(mockUser);
            User.findByIdAndUpdate = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(updatedUser)
            });

            await userController.updateUser(req, res, next);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123', { name: 'Updated Name', email: 'updated@test.com' }, { new: true, runValidators: true }
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser
            });
        });

        it('should remove password from update data', async() => {
            req.params.id = 'user123';
            req.body = { name: 'Test', password: 'newpassword' };

            const mockUser = { _id: 'user123' };

            User.findById = jest.fn().mockResolvedValue(mockUser);
            User.findByIdAndUpdate = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await userController.updateUser(req, res, next);

            // Password should be deleted from req.body
            expect(req.body.password).toBeUndefined();
        });

        it('should return 404 if user not found', async() => {
            req.params.id = 'invalid123';

            User.findById = jest.fn().mockResolvedValue(null);

            await userController.updateUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async() => {
            req.params.id = 'user123';

            const mockUser = {
                _id: 'user123',
                deleteOne: jest.fn().mockResolvedValue({})
            };

            User.findById = jest.fn().mockResolvedValue(mockUser);

            await userController.deleteUser(req, res, next);

            expect(mockUser.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        it('should return 404 if user not found', async() => {
            req.params.id = 'invalid123';

            User.findById = jest.fn().mockResolvedValue(null);

            await userController.deleteUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics', async() => {
            User.countDocuments = jest.fn()
                .mockResolvedValueOnce(100) // totalUsers
                .mockResolvedValueOnce(20) // totalRestaurants
                .mockResolvedValueOnce(5) // totalAdmins
                .mockResolvedValueOnce(15); // newUsersThisMonth

            await userController.getUserStats(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    totalUsers: 100,
                    totalRestaurants: 20,
                    totalAdmins: 5,
                    newUsersThisMonth: 15
                }
            });
        });
    });

    describe('getUserOrders', () => {
        it('should return user orders', async() => {
            req.params.id = 'user123';

            const mockUser = { _id: 'user123' };
            const mockOrders = [
                { _id: 'order1', total: 100000 },
                { _id: 'order2', total: 150000 }
            ];

            User.findById = jest.fn().mockResolvedValue(mockUser);

            // Mock Order model dynamically
            const mockPopulate = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockOrders)
            };

            const Order = require('../../../API/Models/Order');
            Order.find = jest.fn().mockReturnValue(mockPopulate);

            await userController.getUserOrders(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockOrders
            });
        });

        it('should return 404 if user not found', async() => {
            req.params.id = 'invalid123';

            User.findById = jest.fn().mockResolvedValue(null);

            await userController.getUserOrders(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('checkEmailExists', () => {
        it('should return true if email exists', async() => {
            req.query.email = 'existing@test.com';

            User.findOne = jest.fn().mockResolvedValue({ email: 'existing@test.com' });

            await userController.checkEmailExists(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                exists: true
            });
        });

        it('should return false if email does not exist', async() => {
            req.query.email = 'new@test.com';

            User.findOne = jest.fn().mockResolvedValue(null);

            await userController.checkEmailExists(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                exists: false
            });
        });

        it('should return 400 if email not provided', async() => {
            req.query = {};

            await userController.checkEmailExists(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});