import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ServiceExtra {
  name: string;
  price: number;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price_hour?: number;
  price_day?: number;
  price_week?: number;
  min_booking_hours: number;
  extras?: ServiceExtra[];
  active: boolean;
}

interface ServiceManagementModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ServiceManagementModal: React.FC<ServiceManagementModalProps> = ({
  service,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState(service || {
    title: '',
    description: '',
    price_hour: undefined,
    price_day: undefined,
    price_week: undefined,
    min_booking_hours: 1,
    extras: [],
    active: true
  });
  const [newExtra, setNewExtra] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddExtra = () => {
    if (newExtra.name && newExtra.price) {
      setFormData({
        ...formData,
        extras: [...(formData.extras || []), {
          name: newExtra.name,
          price: parseFloat(newExtra.price)
        }]
      });
      setNewExtra({ name: '', price: '' });
    }
  };

  const handleRemoveExtra = (index: number) => {
    setFormData({
      ...formData,
      extras: (formData.extras || []).filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('services')
        .update({
          title: formData.title,
          description: formData.description,
          price_hour: formData.price_hour || null,
          price_day: formData.price_day || null,
          price_week: formData.price_week || null,
          min_booking_hours: formData.min_booking_hours,
          extras: formData.extras && formData.extras.length > 0 ? formData.extras : null,
          active: formData.active
        })
        .eq('id', service?.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Service Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Service Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Hourly Rate (₦)"
              type="number"
              value={formData.price_hour || ''}
              onChange={(e) => setFormData({...formData, price_hour: e.target.value ? parseFloat(e.target.value) : undefined})}
              placeholder="Optional"
            />
            <Input
              label="Daily Rate (₦)"
              type="number"
              value={formData.price_day || ''}
              onChange={(e) => setFormData({...formData, price_day: e.target.value ? parseFloat(e.target.value) : undefined})}
              placeholder="Optional"
            />
            <Input
              label="Weekly Rate (₦)"
              type="number"
              value={formData.price_week || ''}
              onChange={(e) => setFormData({...formData, price_week: e.target.value ? parseFloat(e.target.value) : undefined})}
              placeholder="Optional"
            />
          </div>

          <Input
            label="Minimum Booking Hours"
            type="number"
            value={formData.min_booking_hours}
            onChange={(e) => setFormData({...formData, min_booking_hours: parseInt(e.target.value)})}
            min="1"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service Extras
            </label>

            {formData.extras && formData.extras.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.extras.map((extra, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-medium text-slate-900">{extra.name}</span>
                      <span className="text-slate-600 ml-2">+₦{extra.price.toLocaleString()}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExtra(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Extra name"
                value={newExtra.name}
                onChange={(e) => setNewExtra({...newExtra, name: e.target.value})}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Price"
                value={newExtra.price}
                onChange={(e) => setNewExtra({...newExtra, price: e.target.value})}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExtra}
                disabled={!newExtra.name || !newExtra.price}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Service is active and visible to clients
              </span>
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
