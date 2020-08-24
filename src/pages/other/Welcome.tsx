import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card,} from 'antd';
import styles from './Welcome.less';

export default (): React.ReactNode => (
  <PageContainer>
    <Card>
      <div className={styles.topNavDropdown}>
        <a className={styles.title}>
          商家服务
          <span className={styles.caret} />
        </a>
        <ul>
          <li>
            <a href="/business/index" target="_blank">商家中心</a>
          </li>
          <li>
            <a href="/business/register">商家入驻</a>
          </li>
        </ul>
      </div>
    </Card>
  </PageContainer>
);
