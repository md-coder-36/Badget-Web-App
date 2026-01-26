'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { theme } from '@/lib/theme';

export default function AntdProvider({ children }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
