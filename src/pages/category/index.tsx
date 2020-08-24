import React from 'react';
import styles from './index.less';

export default (): React.ReactNode => (
  <div className={styles.allCategory}>
    <div className={styles.title}>
      <h3>
        <a target="_blank" href="https://java.bizpower.com/web/category">
          所有商品分类
        </a>
      </h3>
      <i className="arrow-down" />
    </div>

  </div>
);
