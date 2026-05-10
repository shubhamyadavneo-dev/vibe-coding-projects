import mockAxios from '../../__mocks__/axios';

export const api = mockAxios;

export const getErrorMessage = jest.fn((error: unknown): string => {
  void error;
  return 'Something went wrong';
});
