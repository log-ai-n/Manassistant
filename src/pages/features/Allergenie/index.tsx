import React, { useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext';
import { AlertTriangle } from 'lucide-react';
import MenuManagement from './MenuManagement';
import AllergenLookup from './AllergenLookup';
import AddMenuItemModal from './AddMenuItemModal';
import ImportMenuModal from './ImportMenuModal';

const Allergenie: React.FC = () => {
  const { features } = useRestaurant();
  const isEnabled = features.some(f => f.feature_key === 'allergenie' && f.is_enabled);
  const [activeTab, setActiveTab] = useState<'menu' | 'lookup'>('menu');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!isEnabled) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Feature Not Enabled</h3>
            <p className="mt-2 text-sm text-yellow-700">
              The Allergenie feature is currently disabled. Please enable it in Restaurant Settings to access this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddSuccess = () => {
    setShowAddModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Allergenie</h1>
        <p className="text-gray-600">Menu and allergen management system</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('menu')}
            className={`${
              activeTab === 'menu'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`${
              activeTab === 'lookup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Allergen Lookup
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'menu' ? (
        <>
          <MenuManagement
            onAddClick={() => setShowAddModal(true)}
            onImportClick={() => setShowImportModal(true)}
            refreshTrigger={refreshTrigger}
          />
          {showAddModal && (
            <AddMenuItemModal
              onClose={() => setShowAddModal(false)}
              onSuccess={handleAddSuccess}
            />
          )}
          {showImportModal && (
            <ImportMenuModal
              onClose={() => setShowImportModal(false)}
              onSuccess={handleImportSuccess}
            />
          )}
        </>
      ) : (
        <AllergenLookup />
      )}
    </div>
  );
};

export default Allergenie;