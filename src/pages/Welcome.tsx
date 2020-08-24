  import React from 'react';
  import { PageContainer } from '@ant-design/pro-layout';
  import { Card,} from 'antd';
  import Category from './category';

  export default (): React.ReactNode => (
    <PageContainer>
      <Card>
        <Category />
      </Card>
    </PageContainer>
  );
