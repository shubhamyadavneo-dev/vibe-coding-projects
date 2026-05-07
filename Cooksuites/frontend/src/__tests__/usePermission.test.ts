import { renderHook } from '@testing-library/react';
import { usePermission, useAnyPermission, useAllPermissions } from '../hooks/usePermission';
import { useSelector } from 'react-redux';

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('usePermission Hooks', () => {
  const mockSelector = jest.mocked(useSelector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePermission', () => {
    it('should return true if user has the specific permission', () => {
      mockSelector.mockReturnValue({ permissions: ['recipe:create', 'recipe:read'] });
      const { result } = renderHook(() => usePermission('recipe:create'));
      expect(result.current).toBe(true);
    });

    it('should return false if user lacks the specific permission', () => {
      mockSelector.mockReturnValue({ permissions: ['recipe:read'] });
      const { result } = renderHook(() => usePermission('recipe:create'));
      expect(result.current).toBe(false);
    });

    it('should return true for any permission if user is admin', () => {
      mockSelector.mockReturnValue({ 
        roles: [{ role: { name: 'admin' } }], 
        permissions: [] 
      });
      const { result } = renderHook(() => usePermission('anything:really'));
      expect(result.current).toBe(true);
    });

    it('should return true if user has admin:manage permission', () => {
      mockSelector.mockReturnValue({ permissions: ['admin:manage'] });
      const { result } = renderHook(() => usePermission('any:action'));
      expect(result.current).toBe(true);
    });
  });

  describe('useAnyPermission', () => {
    it('should return true if user has at least one of the permissions', () => {
      mockSelector.mockReturnValue({ permissions: ['recipe:read'] });
      const { result } = renderHook(() => useAnyPermission(['recipe:create', 'recipe:read']));
      expect(result.current).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      mockSelector.mockReturnValue({ permissions: ['other:perm'] });
      const { result } = renderHook(() => useAnyPermission(['recipe:create', 'recipe:read']));
      expect(result.current).toBe(false);
    });
  });

  describe('useAllPermissions', () => {
    it('should return true only if user has all of the permissions', () => {
      mockSelector.mockReturnValue({ permissions: ['recipe:create', 'recipe:read'] });
      const { result } = renderHook(() => useAllPermissions(['recipe:create', 'recipe:read']));
      expect(result.current).toBe(true);
    });

    it('should return false if user is missing at least one permission', () => {
      mockSelector.mockReturnValue({ permissions: ['recipe:create'] });
      const { result } = renderHook(() => useAllPermissions(['recipe:create', 'recipe:read']));
      expect(result.current).toBe(false);
    });
  });
});
