module.exports = {
  USER_LOGIN_FAILED_WRONG_CREDENTIALS: {
    name: 'USER_LOGIN_FAILED_WRONG_CREDENTIALS',
    message: 'wrong credentials',
    statusCode: 403,
  },
  USER_PASS_EMPTY: {
    name: 'USER_PASS_EMPTY',
    message: 'password must not be empty or contain spaces',
    statusCode: 400,
  },
  USER_NOT_EXIST: {
    name: 'USER_NOT_EXIST',
    message: 'user does not exist',
    statusCode: 400,
  },
  USER_CREATION_FAILED: (object, error) => {
    return {
      name: 'USER_CREATION_FAILED',
      message: 'failed to create user',
      target: object,
      innerError: error
    }
  },
  USER_CREATION_FAILED_MISSING_FIELDS: (object) => {
    return {
      name: 'USER_CREATION_FAILED_MISSING_FIELDS',
      message: "one of the fields is missing: id, createdDate, firstName, lastName, username, sessionTimeout",
      target: object
    }
  },
  USER_UPDATE_FAILED: (id, object, error) => {
    return {
      name: 'USER_UPDATE_FAILED',
      message: 'failed to update user',
      target: [id, object],
      innerError: error
    }
  },
  USER_REMOVAL_FAILED: (id, error) => {
    return {
      name: 'USER_REMOVAL_FAILED',
      message: 'failed to remove user',
      target: id,
      innerError: error
    }
  },
  INVALID_PERMISSION: (permission, permissionsArray) => {
    return {
      name: 'INVALID_PERMISSION',
      message: `permission [${permission}] is invalid`,
      target: permissionsArray
    }
  },
  USER_CREATION_FAILED_MISSING_PERMISSION_FIELDS: (object) => {
    return {
      name: 'USER_CREATION_FAILED_MISSING_PERMISSION_FIELDS',
      message: "one of the fields is missing: userId, permissions",
      target: object
    }
  },
  USER_CREATION_FAILED_PERMISSION_OBJECT: (object, error) => {
    return {
      name: 'USER_CREATION_FAILED_PERMISSION_OBJECT',
      message: 'failed to create permissions object',
      target: object,
      innerError: error
    }
  },
  USER_UPDATE_FAILED_PERMISSION_OBJECT: (id, object, error) => {
    return {
      name: 'USER_UPDATE_FAILED_PERMISSION_OBJECT',
      message: 'failed to update permissions object',
      target: [id, object],
      innerError: error
    }
  },
  USER_REMOVAL_FAILED_PERMISSION_OBJECT: (id, error) => {
    return {
      name: 'USER_REMOVAL_FAILED_PERMISSION_OBJECT',
      message: 'failed to remove permissions object',
      target: id,
      innerError: error
    }
  },
  RESTRICTED_PAGE_ACCESS_MISSING_PERMISSION: (permission) => {
    return {
      name: 'RESTRICTED_PAGE_ACCESS_MISSING_PERMISSION',
      message: `Insufficient permissions. permission '${permission}' is required to perform this action.`,
      action: {
        type: 'admin',
        operation: 'addPermission',
        what: permission
      }
    }
  },
  RESTRICTED_PAGE_ACCESS_MISSING_TOKEN: (actionTo) => {
    return {
      name: "RESTRICTED_PAGE_ACCESS_MISSING_TOKEN",
      message: "This page is accessible only to users who are logged in. If you are logged in already please send the request with the authorization token.",
      action: { // suggested action
          type: "retry",
          to: actionTo
      }
    }
  },
  RESTRICTED_PAGE_ACCESS_INVALID_TOKEN: (error) => {
    return {
      name: "RESTRICTED_PAGE_ACCESS_INVALID_TOKEN",
      message: "This page is accessible only to users who are logged in with a valid(!) token.",
      error: error,
      action: { // suggested action
          type: "redirect",
          to: "login"
      }
    }
  }
}