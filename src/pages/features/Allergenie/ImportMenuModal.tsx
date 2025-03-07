import React, { useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext';
import { supabase } from '../../../lib/supabase';
import { X, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { createWorker } from 'tesseract.js';
import clsx from 'clsx';

type ImportMenuModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type MenuItemImport = {
  name: string;
  description?: string;
  category?: string;
  price?: string;
  allergens?: string;
};

const ImportMenuModal: React.FC<ImportMenuModalProps> = ({ onClose, onSuccess }) => {
  const { currentRestaurant } = useRestaurant();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MenuItemImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allergens, setAllergens] = useState<{ id: string; name: string }[]>([]);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageText, setImageText] = useState<string>('');

  React.useEffect(() => {
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAllergens(data || []);
    } catch (err) {
      console.error('Error fetching allergens:', err);
      setError('Failed to load allergens');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFile(file);
      setError(null);
      setPreview([]);

      if (file.type === 'text/csv') {
        handleCSVFile(file);
      } else if (file.type.startsWith('image/')) {
        await handleImageFile(file);
      }
    }
  });

  const handleCSVFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file');
          return;
        }

        const requiredColumns = ['name'];
        const hasRequiredColumns = requiredColumns.every(col => 
          results.meta.fields?.includes(col)
        );

        if (!hasRequiredColumns) {
          setError('CSV file must include a "name" column');
          return;
        }

        setPreview(results.data as MenuItemImport[]);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleImageFile = async (file: File) => {
    setProcessingImage(true);
    setError(null);

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setImageText(text);

      // Basic parsing of menu items from text
      const items = parseMenuItems(text);
      setPreview(items);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image');
    } finally {
      setProcessingImage(false);
    }
  };

  const parseMenuItems = (text: string): MenuItemImport[] => {
    // Split text into lines and try to identify menu items
    const lines = text.split('\n').filter(line => line.trim());
    const items: MenuItemImport[] = [];
    
    let currentCategory = '';
    
    for (const line of lines) {
      // Try to identify if this line is a category
      if (line.toUpperCase() === line && !line.includes('$')) {
        currentCategory = line.trim();
        continue;
      }

      // Try to identify menu items (lines with prices)
      const priceMatch = line.match(/\$\s*(\d+\.?\d*)/);
      if (priceMatch) {
        const price = priceMatch[1];
        const name = line.substring(0, line.indexOf('$')).trim();
        
        if (name) {
          items.push({
            name,
            category: currentCategory,
            price,
            description: '',
          });
        }
      }
    }

    return items;
  };

  const downloadTemplate = () => {
    const template = [
      ['name', 'description', 'category', 'price', 'allergens'],
      ['Cheeseburger', 'Classic beef burger with cheese', 'Mains', '12.99', 'Milk, Wheat'],
      ['Caesar Salad', 'Romaine lettuce with parmesan', 'Salads', '9.99', 'Eggs, Milk'],
      ['Chocolate Cake', 'Rich chocolate dessert', 'Desserts', '6.99', 'Milk, Eggs, Wheat'],
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'menu_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!currentRestaurant || !preview.length) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const allergenMap = new Map(
        allergens.map(a => [a.name.toLowerCase(), a.id])
      );

      for (let i = 0; i < preview.length; i++) {
        const item = preview[i];
        
        // Insert menu item
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .insert({
            restaurant_id: currentRestaurant.id,
            name: item.name,
            description: item.description || null,
            category: item.category || null,
            price: item.price ? parseFloat(item.price) : null,
            active: true,
          })
          .select()
          .single();

        if (menuError) throw menuError;

        // Process allergens if any
        if (item.allergens) {
          const allergenNames = item.allergens.split(',').map(a => a.trim().toLowerCase());
          const allergenIds = allergenNames
            .map(name => allergenMap.get(name))
            .filter((id): id is string => id !== undefined);

          if (allergenIds.length > 0) {
            const allergenAssociations = allergenIds.map(allergenId => ({
              menu_item_id: menuItem.id,
              allergen_id: allergenId,
              severity_level: 1, // Default severity
            }));

            const { error: allergenError } = await supabase
              .from('menu_allergens')
              .insert(allergenAssociations);

            if (allergenError) throw allergenError;
          }
        }

        // Update progress
        setProgress(Math.round(((i + 1) / preview.length) * 100));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error importing menu items:', err);
      setError('Failed to import menu items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Import Menu Items</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Import Successful</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your menu items have been imported successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Template Download */}
              <div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  Download a sample CSV template to see the required format.
                </p>
              </div>

              {/* File Upload */}
              <div
                {...getRootProps()}
                className={clsx(
                  "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md",
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                  processingImage && "opacity-50 cursor-wait"
                )}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input {...getInputProps()} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV files or images (JPG, PNG)</p>
                </div>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Preview ({preview.length} items)
                  </h3>
                  <div className="max-h-64 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allergens
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.price ? `$${parseFloat(item.price).toFixed(2)}` : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.allergens}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {loading && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || preview.length === 0}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Importing...' : `Import ${preview.length} Items`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportMenuModal;