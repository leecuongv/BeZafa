const ACCOUNT_TYPES = {
  LITE: "LITE",
  PRO: "PRO",
};

const DEFAULT_VALUES = {
  AVATAR: 'https://1.bp.blogspot.com/-CV8fOXMMw60/YZ-UJ4X9sAI/AAAAAAAACMc/2Svet97exjgNdJ9CeTKUU3OuA-mnCQEzwCLcBGAsYHQ/s595/3a.jpg',
  IMAGE_COURSE: ""
};

const COLLECTION = {
  BILL: "Bill",
  USER: "User",
  LOG: "Logs",
  CHAT: "Chats",
  MESSAGE: "Messages",
  FILE: "File"
};

const TYPEOFPOINT = {
  MAX: 'max',
  AVG: 'avg',
  LAST: 'last'
}
const VIEWPOINT = {
  NO: 'no',
  DONE: 'done',
  ALLDONE: 'alldone'
}
const VIEWANSWER = {
  NO: 'no',
  DONE: 'done',
  ALLDONE: 'alldone'
}

const STATUS = {
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  OK: 'ok',
  ARCHIVED: 'archived',
  NOT_SUBMITTED: 'not submitted',
  SUBMITTED: 'submitted',
  PASSED: 'passed',
  FAILED: 'failed',
  SUCCESS: 'success',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PUBLIC: 'public',
  PRIVATE: 'private',
  CLOSE: 'close',
  ALLOW: 'allow',
  NOTALLOW: 'not allow'
};

const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};
const TYPE_ACCOUNT = {
  NORMAL: "NORMAL",
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
};

module.exports = { STATUS, TYPE_ACCOUNT, ROLES, COLLECTION, DEFAULT_VALUES, ACCOUNT_TYPES, TYPEOFPOINT, VIEWPOINT, VIEWANSWER }