import { useState, useEffect } from 'react';
import { componentTypeService, ComponentType } from '@/services/api';

interface UseComponentTypesReturn {
  componentTypes: ComponentType[];
  isLoading: boolean;
  error: string | null;
  fetchComponentTypes: () => Promise<void>;
  getComponentTypeById: (id: string) => ComponentType | undefined;
}

export function useComponentTypes(): UseComponentTypesReturn {
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponentTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching component types...');
      const response = await componentTypeService.getAllComponentTypes();
      console.log('Component types response:', response);
      
      if (response.success && response.data) {
        setComponentTypes(response.data);
        console.log('Component types set:', response.data);
      } else {
        setError(response.message || 'Failed to load component types');
        console.error('Failed to load component types:', response.message);
      }
    } catch (err) {
      console.error('Error fetching component types:', err);
      setError('An error occurred while fetching component types');
    } finally {
      setIsLoading(false);
    }
  };

  const getComponentTypeById = (id: string): ComponentType | undefined => {
    return componentTypes.find(componentType => componentType.id === id);
  };

  useEffect(() => {
    fetchComponentTypes();
  }, []);

  return {
    componentTypes,
    isLoading,
    error,
    fetchComponentTypes,
    getComponentTypeById
  };
} 