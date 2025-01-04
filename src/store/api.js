import Cookies from 'js-cookie';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: {
    'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN'),
  },
});

export default api;