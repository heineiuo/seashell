// socket emit types
export const I_HAVE_HANDLE_THIS_REQUEST = 'I_HAVE_HANDLE_THIS_REQUEST';
export const I_HAVE_A_REQUEST = 'I_HAVE_A_REQUEST';

/**
 * handle hub's response about register
 * if there's some error, means register has failed
 * otherwise, it succeed
 */
export const YOUR_REGISTER_HAS_RESPONSE = 'YOUR_REGISTER_HAS_RESPONSE';

/**
 * handle response
 * response should have `callbackId` key.
 */
export const YOUR_REQUEST_HAS_RESPONSE = 'YOUR_REQUEST_HAS_RESPONSE';

/**
 * handle request
 */
export const PLEASE_HANDLE_THIS_REQUEST = 'PLEASE_HANDLE_THIS_REQUEST';
// callback emit types
export const RESPONSE = 'RESPONSE';
// ctx emit types
export const end = 'end';
export const error = 'error';