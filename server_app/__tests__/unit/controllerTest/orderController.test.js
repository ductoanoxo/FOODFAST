const orderController = require('../../../API/Controllers/orderController');

describe('Order Controller - Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { _id: 'user123', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('Controller Structure', () => {
        it('should export createOrder function', () => {
            expect(orderController.createOrder).toBeDefined();
            expect(typeof orderController.createOrder).toBe('function');
        });

        it('should export getOrders function', () => {
            expect(orderController.getOrders).toBeDefined();
            expect(typeof orderController.getOrders).toBe('function');
        });

        it('should export getOrderById function', () => {
            expect(orderController.getOrderById).toBeDefined();
            expect(typeof orderController.getOrderById).toBe('function');
        });

        it('should export updateOrderStatus function', () => {
            expect(orderController.updateOrderStatus).toBeDefined();
            expect(typeof orderController.updateOrderStatus).toBe('function');
        });

        it('should export trackOrder function', () => {
            expect(orderController.trackOrder).toBeDefined();
            expect(typeof orderController.trackOrder).toBe('function');
        });

        it('should export cancelOrder function', () => {
            expect(orderController.cancelOrder).toBeDefined();
            expect(typeof orderController.cancelOrder).toBe('function');
        });

        it('should export getOrderHistory function', () => {
            expect(orderController.getOrderHistory).toBeDefined();
            expect(typeof orderController.getOrderHistory).toBe('function');
        });

        it('should export confirmDelivery function', () => {
            expect(orderController.confirmDelivery).toBeDefined();
            expect(typeof orderController.confirmDelivery).toBe('function');
        });

        it('should export restaurantConfirmHandover function', () => {
            expect(orderController.restaurantConfirmHandover).toBeDefined();
            expect(typeof orderController.restaurantConfirmHandover).toBe('function');
        });

        it('should export calculateFee function', () => {
            expect(orderController.calculateFee).toBeDefined();
            expect(typeof orderController.calculateFee).toBe('function');
        });
    });

    describe('Function Exports', () => {
        it('should have all required order management functions', () => {
            const requiredFunctions = [
                'createOrder',
                'getOrders',
                'getOrderById',
                'updateOrderStatus',
                'trackOrder',
                'cancelOrder',
                'getOrderHistory',
                'confirmDelivery',
                'restaurantConfirmHandover',
                'calculateFee'
            ];

            requiredFunctions.forEach(funcName => {
                expect(orderController[funcName]).toBeDefined();
                expect(typeof orderController[funcName]).toBe('function');
            });
        });
    });

    describe('createOrder - Validation Tests', () => {
        it('should reject when items array is empty', async() => {
            req.body = { items: [], deliveryInfo: {} };

            await orderController.createOrder(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('No order items');
        });

        it('should reject when deliveryInfo is missing', async() => {
            req.body = { items: [{ product: 'p1', quantity: 1 }] };

            await orderController.createOrder(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Delivery information is required');
        });

        it('should reject when deliveryInfo.name is missing', async() => {
            req.body = {
                items: [{ product: 'p1', quantity: 1 }],
                deliveryInfo: { phone: '0123456789', address: '123 St' }
            };

            await orderController.createOrder(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Delivery information is required');
        });

        it('should reject when deliveryInfo.phone is missing', async() => {
            req.body = {
                items: [{ product: 'p1', quantity: 1 }],
                deliveryInfo: { name: 'Test', address: '123 St' }
            };

            await orderController.createOrder(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Delivery information is required');
        });

        it('should reject when deliveryInfo.address is missing', async() => {
            req.body = {
                items: [{ product: 'p1', quantity: 1 }],
                deliveryInfo: { name: 'Test', phone: '0123456789' }
            };

            await orderController.createOrder(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Delivery information is required');
        });
    });

    describe('calculateFee - Input Validation', () => {
        it('should reject when restaurantId is missing', async() => {
            req.body = { userAddress: '123 St' };

            await orderController.calculateFee(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Restaurant ID and user address are required');
        });

        it('should reject when userAddress is missing', async() => {
            req.body = { restaurantId: 'rest123' };

            await orderController.calculateFee(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Restaurant ID and user address are required');
        });
    });
});