import http from '../http-common';

class UsersDataService {
  testUserLogin(username, password) {
    return http.post('/users/login', { username, password });
  }
}

export default new UsersDataService();
