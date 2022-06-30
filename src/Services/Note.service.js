import http from '../http-common';

class NoteDataService {
  createNote(iduser, title, content) {
    return http.post('/note/create', { iduser, title, content });
  }
  getNoteFromUser(iduser) {
    return http.post('/note/', { iduser });
  }
  deleteNote(id) {
    return http.post('/note/delete', { id });
  }
}

export default new NoteDataService();
