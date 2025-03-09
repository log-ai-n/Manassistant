import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { 
  Memory,
  getMemories, 
  createMemory, 
  updateMemory, 
  deleteMemory, 
  SearchMemoryParams 
} from '../../services/memoryService';

const Memories: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newMemory, setNewMemory] = useState({
    memory_content: '',
    context: '',
    importance: 1
  });
  
  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Memory | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchContext, setSearchContext] = useState('');

  // Load memories on component mount and when restaurant changes
  useEffect(() => {
    if (currentRestaurant?.id) {
      loadMemories();
    }
  }, [currentRestaurant]);

  const loadMemories = async () => {
    if (!currentRestaurant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchParams: SearchMemoryParams = {
        restaurant_id: currentRestaurant.id,
      };
      
      if (searchQuery) {
        searchParams.query = searchQuery;
      }
      
      if (searchContext) {
        searchParams.context = searchContext;
      }
      
      const data = await getMemories(searchParams);
      setMemories(data);
    } catch (err) {
      setError('Failed to load memories');
      console.error('Error loading memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMemories();
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRestaurant?.id || !newMemory.memory_content.trim()) {
      setError('Memory content is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await createMemory({
        restaurant_id: currentRestaurant.id,
        memory_content: newMemory.memory_content,
        context: newMemory.context || undefined,
        importance: newMemory.importance
      });
      
      if (result) {
        setMemories([result, ...memories]);
        setNewMemory({
          memory_content: '',
          context: '',
          importance: 1
        });
      } else {
        setError('Failed to create memory');
      }
    } catch (err) {
      setError('Failed to create memory');
      console.error('Error creating memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMemory?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateMemory({
        id: currentMemory.id,
        memory_content: currentMemory.memory_content,
        context: currentMemory.context,
        importance: currentMemory.importance
      });
      
      if (result) {
        // Update the memories list with the edited memory
        setMemories(memories.map(m => m.id === result.id ? result : m));
        setEditMode(false);
        setCurrentMemory(null);
      } else {
        setError('Failed to update memory');
      }
    } catch (err) {
      setError('Failed to update memory');
      console.error('Error updating memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await deleteMemory(id);
      
      if (success) {
        setMemories(memories.filter(m => m.id !== id));
      } else {
        setError('Failed to delete memory');
      }
    } catch (err) {
      setError('Failed to delete memory');
      console.error('Error deleting memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditMemory = (memory: Memory) => {
    setCurrentMemory(memory);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setCurrentMemory(null);
    setEditMode(false);
  };

  // If no restaurant is selected
  if (!currentRestaurant) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Restaurant Memories</h1>
        <p>Please select a restaurant to manage memories.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Restaurant Memories</h1>
      <p className="mb-6">Manage AI assistant memories for {currentRestaurant.name}</p>

      {/* Search form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Search Memories</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search memory content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Context (optional)"
            value={searchContext}
            onChange={(e) => setSearchContext(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:flex-initial"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {editMode && currentMemory ? (
        /* Edit memory form */
        <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">Edit Memory</h2>
          <form onSubmit={handleUpdateMemory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory Content</label>
              <textarea
                value={currentMemory.memory_content}
                onChange={(e) => setCurrentMemory({...currentMemory, memory_content: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Context (Optional)</label>
              <input
                type="text"
                value={currentMemory.context || ''}
                onChange={(e) => setCurrentMemory({...currentMemory, context: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Importance (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentMemory.importance}
                onChange={(e) => setCurrentMemory({...currentMemory, importance: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Create memory form */
        <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">Add New Memory</h2>
          <form onSubmit={handleCreateMemory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory Content</label>
              <textarea
                value={newMemory.memory_content}
                onChange={(e) => setNewMemory({...newMemory, memory_content: e.target.value})}
                placeholder="Enter memory content..."
                rows={3}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Context (Optional)</label>
              <input
                type="text"
                value={newMemory.context}
                onChange={(e) => setNewMemory({...newMemory, context: e.target.value})}
                placeholder="e.g., guest preferences, menu info"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Importance (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newMemory.importance}
                onChange={(e) => setNewMemory({...newMemory, importance: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Memory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Memory list */}
      <div className="bg-white border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold p-4 border-b">Memories</h2>
        
        {loading && memories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No memories found. Add your first memory above.</div>
        ) : (
          <ul className="divide-y">
            {memories.map(memory => (
              <li key={memory.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="mb-2">{memory.memory_content}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {memory.context && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {memory.context}
                        </span>
                      )}
                      <span>Importance: {memory.importance}</span>
                      <span>Created: {new Date(memory.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditMemory(memory)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Memories; 