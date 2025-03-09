import React, { useEffect, useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { 
  getRecentMemories, 
  createMemory, 
  getMemories,
  deleteMemory,
  updateMemory,
  Memory 
} from '../services/memoryService';

/**
 * A component for testing the memory service functionality
 * This is for development/testing purposes only
 */
const MemoryTester: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newMemory, setNewMemory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [context, setContext] = useState('');
  const [importance, setImportance] = useState(1);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

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
      const recentMemories = await getRecentMemories(currentRestaurant.id);
      setMemories(recentMemories);
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentRestaurant?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchedMemories = await getMemories({
        restaurant_id: currentRestaurant.id,
        query: searchQuery || undefined,
        context: context || undefined,
        limit: 10
      });
      
      setMemories(searchedMemories);
    } catch (err) {
      console.error('Error searching memories:', err);
      setError('Failed to search memories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.trim() || !currentRestaurant?.id) return;
    
    setError(null);
    
    try {
      const memory = await createMemory({
        restaurant_id: currentRestaurant.id,
        memory_content: newMemory,
        context: context || undefined,
        importance: importance,
        user_id: undefined // Will use the current authenticated user
      });
      
      if (memory) {
        setMemories([memory, ...memories]);
        setNewMemory('');
        setContext('');
        setImportance(1);
      }
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('Failed to create memory');
    }
  };

  const handleUpdateMemory = async () => {
    if (!editingMemory) return;
    
    setError(null);
    
    try {
      const updated = await updateMemory({
        id: editingMemory.id,
        memory_content: editingMemory.memory_content,
        context: editingMemory.context || undefined,
        importance: editingMemory.importance
      });
      
      if (updated) {
        setMemories(memories.map(m => m.id === updated.id ? updated : m));
        setEditingMemory(null);
      }
    } catch (err) {
      console.error('Error updating memory:', err);
      setError('Failed to update memory');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setError(null);
    
    try {
      const success = await deleteMemory(id);
      
      if (success) {
        setMemories(memories.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
      setError('Failed to delete memory');
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">Please select a restaurant to test memories.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Memory Tester</h2>
        <p className="text-sm text-gray-500 mb-4">
          Testing component for the restaurant memory system. 
          Current restaurant: <span className="font-semibold">{currentRestaurant.name}</span>
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Add New Memory</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memory Content</label>
              <textarea
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="Add a new restaurant memory..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Context (optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., customer-preference"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importance (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={importance}
                  onChange={(e) => setImportance(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleAddMemory}
            >
              Add Memory
            </button>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Search Memories</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memory content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Context Filter</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Filter by context..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSearch}
              >
                Search
              </button>
              
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={loadMemories}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Memories {loading && '(Loading...)'}</h3>
          
          {!loading && memories.length === 0 ? (
            <p className="text-gray-500">No memories found.</p>
          ) : (
            <div className="space-y-4">
              {memories.map((memory) => (
                <div key={memory.id} className="p-4 border rounded-lg">
                  {editingMemory?.id === memory.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full p-2 border rounded"
                        value={editingMemory.memory_content}
                        onChange={(e) => setEditingMemory({
                          ...editingMemory,
                          memory_content: e.target.value
                        })}
                        rows={3}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={editingMemory.context || ''}
                            onChange={(e) => setEditingMemory({
                              ...editingMemory,
                              context: e.target.value || undefined
                            })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Importance</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="w-full p-2 border rounded"
                            value={editingMemory.importance}
                            onChange={(e) => setEditingMemory({
                              ...editingMemory,
                              importance: parseInt(e.target.value) || 1
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded"
                          onClick={handleUpdateMemory}
                        >
                          Save
                        </button>
                        
                        <button
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                          onClick={() => setEditingMemory(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800">{memory.memory_content}</p>
                      
                      <div className="mt-3 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>ID: {memory.id.substring(0, 6)}...</span>
                        {memory.context && <span>Context: {memory.context}</span>}
                        <span>Importance: {memory.importance}</span>
                        <span>Created: {new Date(memory.created_at).toLocaleString()}</span>
                        {memory.last_accessed && (
                          <span>Last accessed: {new Date(memory.last_accessed).toLocaleString()}</span>
                        )}
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <button
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                          onClick={() => setEditingMemory(memory)}
                        >
                          Edit
                        </button>
                        
                        <button
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                          onClick={() => handleDeleteMemory(memory.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryTester; 