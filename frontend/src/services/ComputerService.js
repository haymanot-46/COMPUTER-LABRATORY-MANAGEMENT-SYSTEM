import api from './ApiService';

class ComputerService {
  // Get all computers - ✅ FIXED method name
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/computers${params ? `?${params}` : ''}`);
      // Handle response properly
      if (response && response.success !== undefined) {
        return { success: response.success, data: response.data || [] };
      }
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('Error fetching computers:', error);
      return { success: false, message: 'Failed to fetch computers', data: [] };
    }
  }

  // Alias for getAll (for compatibility)
  async getComputers(filters = {}) {
    return this.getAll(filters);
  }

  // Get computer by ID
  async getById(id) {
    try {
      const response = await api.get(`/computers/${id}`);
      if (response && response.success !== undefined) {
        return { success: response.success, data: response.data };
      }
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching computer:', error);
      return { success: false, message: 'Computer not found', data: null };
    }
  }

  // Create new computer
  async create(computerData) {
    try {
      const payload = {
        asset_tag: computerData.asset_tag,
        workstation_number: computerData.name,
        code: computerData.asset_tag,
        model: computerData.model,
        serial_number: computerData.serial_number,
        laboratory_id: parseInt(computerData.laboratory_id),
        processor: computerData.processor,
        ram: computerData.ram,
        storage: computerData.storage,
        operating_system: computerData.operating_system,
        ip_address: computerData.ip_address,
        mac_address: computerData.mac_address,
        status: computerData.status,
        purchase_date: computerData.purchase_date,
        warranty_expiry: computerData.warranty_expiry,
        notes: computerData.notes
      };
      
      const response = await api.post('/computers', payload);
      if (response && response.success !== undefined) {
        return { success: response.success, data: response.data, message: response.message };
      }
      return { success: true, message: 'Computer added successfully' };
    } catch (error) {
      console.error('Error creating computer:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add computer'
      };
    }
  }

  // Update computer
  async update(id, computerData) {
    try {
      const response = await api.put(`/computers/${id}`, computerData);
      return { success: true, message: 'Computer updated successfully' };
    } catch (error) {
      console.error('Error updating computer:', error);
      return { success: false, message: 'Failed to update computer' };
    }
  }

  // Delete computer
  async delete(id) {
    try {
      const response = await api.delete(`/computers/${id}`);
      return { success: true, message: 'Computer deleted successfully' };
    } catch (error) {
      console.error('Error deleting computer:', error);
      return { success: false, message: 'Failed to delete computer' };
    }
  }

  // Update computer status
  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/computers/${id}/status`, { status });
      return { success: true, message: 'Status updated successfully' };
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, message: 'Failed to update status' };
    }
  }

  // Get computer statistics
  async getStatistics() {
    try {
      const response = await api.get('/computers/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { success: false, data: null };
    }
  }
}

export default new ComputerService();