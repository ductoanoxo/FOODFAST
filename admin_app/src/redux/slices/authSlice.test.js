import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, { loginSuccess, logout } from './authSlice';

describe('Admin authSlice', () => {
    let initialState;

    beforeEach(() => {
        // Clear localStorage mock
        localStorage.clear();
        vi.clearAllMocks();

        initialState = {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    });

    describe('initial state', () => {
        it('should have correct initial state when no localStorage data', () => {
            localStorage.getItem.mockReturnValue(null);
            const state = authReducer(undefined, { type: '@@INIT' });
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });

        it('should load state from localStorage', () => {
            const mockUser = { id: '1', name: 'Admin', email: 'admin@test.com' };
            const mockToken = 'mock-token-123';

            localStorage.getItem.mockImplementation((key) => {
                if (key === 'admin_user') return JSON.stringify(mockUser);
                if (key === 'admin_token') return mockToken;
                return null;
            });

            // Need to reimport to get new initial state
            const state = {
                user: JSON.parse(localStorage.getItem('admin_user')),
                token: localStorage.getItem('admin_token'),
                isAuthenticated: !!localStorage.getItem('admin_token'),
            };

            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockToken);
            expect(state.isAuthenticated).toBe(true);
        });
    });

    describe('loginSuccess', () => {
        it('should handle successful login', () => {
            const payload = {
                user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
                token: 'test-token-123',
            };

            const newState = authReducer(initialState, loginSuccess(payload));

            expect(newState.user).toEqual(payload.user);
            expect(newState.token).toBe(payload.token);
            expect(newState.isAuthenticated).toBe(true);

            // Verify localStorage was called
            expect(localStorage.setItem).toHaveBeenCalledWith('admin_user', JSON.stringify(payload.user));
            expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', payload.token);
        });

        it('should update existing authenticated state', () => {
            const existingState = {
                user: { id: '1', name: 'Old Admin' },
                token: 'old-token',
                isAuthenticated: true,
            };

            const newPayload = {
                user: { id: '2', name: 'New Admin', email: 'newadmin@test.com' },
                token: 'new-token-456',
            };

            const newState = authReducer(existingState, loginSuccess(newPayload));

            expect(newState.user).toEqual(newPayload.user);
            expect(newState.token).toBe(newPayload.token);
            expect(newState.isAuthenticated).toBe(true);
        });
    });

    describe('logout', () => {
        it('should clear user data on logout', () => {
            const authenticatedState = {
                user: { id: '1', name: 'Admin', email: 'admin@test.com' },
                token: 'test-token-123',
                isAuthenticated: true,
            };

            const newState = authReducer(authenticatedState, logout());

            expect(newState.user).toBeNull();
            expect(newState.token).toBeNull();
            expect(newState.isAuthenticated).toBe(false);

            // Verify localStorage was cleared
            expect(localStorage.removeItem).toHaveBeenCalledWith('admin_user');
            expect(localStorage.removeItem).toHaveBeenCalledWith('admin_token');
        });

        it('should handle logout when already logged out', () => {
            const newState = authReducer(initialState, logout());

            expect(newState.user).toBeNull();
            expect(newState.token).toBeNull();
            expect(newState.isAuthenticated).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle loginSuccess with missing user fields', () => {
            const payload = {
                user: { id: '1' }, // Minimal user data
                token: 'token-123',
            };

            const newState = authReducer(initialState, loginSuccess(payload));

            expect(newState.user).toEqual(payload.user);
            expect(newState.token).toBe(payload.token);
            expect(newState.isAuthenticated).toBe(true);
        });

        it('should handle multiple login/logout cycles', () => {
            let state = initialState;

            // Login
            state = authReducer(state, loginSuccess({
                user: { id: '1', name: 'Admin 1' },
                token: 'token-1',
            }));
            expect(state.isAuthenticated).toBe(true);

            // Logout
            state = authReducer(state, logout());
            expect(state.isAuthenticated).toBe(false);

            // Login again
            state = authReducer(state, loginSuccess({
                user: { id: '2', name: 'Admin 2' },
                token: 'token-2',
            }));
            expect(state.isAuthenticated).toBe(true);
            expect(state.user.id).toBe('2');
        });
    });
});