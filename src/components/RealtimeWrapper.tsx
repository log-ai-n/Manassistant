import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

interface RealtimeWrapperProps<T extends Record<string, any>> {
  config: RealtimeConfig;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  children: React.ReactNode;
}

export function RealtimeWrapper<T extends Record<string, any>>({
  config,
  onUpdate,
  children,
}: RealtimeWrapperProps<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const { table, event = '*', filter } = config;

    // Create a new realtime channel
    const channel = supabase.channel(`public:${table}`)
      .on(
        'postgres_changes' as any, // Type assertion needed due to Supabase types
        { event, schema: 'public', table, filter },
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log('Change received!', payload);
          onUpdate?.(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
      });

    setChannel(channel);

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [config, onUpdate]);

  return <>{children}</>;
}

// Example usage:
/*
<RealtimeWrapper<TodoItem>
  config={{
    table: 'todos',
    event: 'INSERT',
    filter: 'user_id=eq.123'
  }}
  onUpdate={(payload) => {
    console.log('New todo:', payload.new);
  }}
>
  <TodoList />
</RealtimeWrapper>
*/ 