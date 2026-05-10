import { SEARCH_PARAMS } from '@/constants/search-params';
import { Button } from 'antd';
import { Grid, List } from 'lucide-react';
import { useQueryParam } from 'use-query-params';

const ViewMode = () => {
  const [viewMode, setViewMode] = useQueryParam<string>(SEARCH_PARAMS.VIEW_MODE);

  return (
    <Button
      icon={viewMode === 'grid' ? <Grid size={16} /> : <List size={16} />}
      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
    />
  );
};

export default ViewMode;
