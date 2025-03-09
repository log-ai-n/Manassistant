import { useEffect, useState } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { RealtimeWrapper } from './RealtimeWrapper';
import { Activity } from 'lucide-react';
import { Database } from '../types/supabase';

type ActivityItem = Database['public']['Tables']['activities']['Row'];

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  const handleRealtimeUpdate = (payload: RealtimePostgresChangesPayload<ActivityItem>) => {
    if (payload.eventType === 'INSERT') {
      setActivities((current) => [payload.new, ...current].slice(0, 10));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RealtimeWrapper<ActivityItem>
      config={{
        table: 'activities',
        event: 'INSERT',
      }}
      onUpdate={handleRealtimeUpdate}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Activity Feed</h2>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities yet</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                    {Object.entries(activity.details).map(([key, value]) => (
                      <div key={key} className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">{key}:</span>{' '}
                        {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RealtimeWrapper>
  );
} 