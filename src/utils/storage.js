const Storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Error obteniendo dato:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { value };
    } catch (error) {
      console.error('Error guardando dato:', error);
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando dato:', error);
      return false;
    }
  }
};

export default Storage;