import authReducer, { setCredentials, logout, updateUser } from '../store/slices/authSlice';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const user = { id: '1', email: 'test@example.com', fullName: 'Test User' };
    const token = 'token-123';
    const actual = authReducer(initialState, setCredentials({ user, token }));
    
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(user);
    expect(actual.token).toBe(token);
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('should handle logout', () => {
    const state = {
      user: { id: '1', email: 'test@example.com' },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
    };
    const actual = authReducer(state, logout());
    expect(actual).toEqual(initialState);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle updateUser', () => {
    const state = {
      user: { id: '1', email: 'test@example.com', permissions: [] },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
    };
    const updatedUser = { ...state.user, permissions: ['recipe:create'] };
    const actual = authReducer(state as any, updateUser(updatedUser as any));
    expect(actual.user.permissions).toEqual(['recipe:create']);
  });
});
