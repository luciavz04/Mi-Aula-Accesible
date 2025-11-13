// src/utils/storage.js

const Storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Error al obtener dato de Storage:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error al guardar en Storage:', error);
      return false;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar de Storage:', error);
      return false;
    }
  }
};

export default Storage;
