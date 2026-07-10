import { supabaseServer } from '@/lib/supabase-server';

async function checkSchema() {
  const { data, error } = await supabaseServer
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'visitors')
    .eq('table_schema', 'public');

  if (error) {
    console.error('Error fetching schema:', error);
  } else {
    console.log('Columns in visitors table:', data);
  }
}

checkSchema();
