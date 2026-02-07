'use client';

import { Layout, Drawer, Grid } from 'antd';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function DashboardLayout({ children }) {
    const screens = useBreakpoint();
    const [collapsed, setCollapsed] = useState(false);

    // Mobile check
    const isMobile = !screens.md;

    return (
        <Layout className="min-h-screen h-full">
            {!isMobile && (
                <Sidebar
                    collapsed={true}
                    mobile={false}
                />
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setCollapsed(false)}
                    open={collapsed}
                    width={250}
                    bodyStyle={{ padding: 0, backgroundColor: '#001529' }}
                    headerStyle={{ display: 'none' }}
                >
                    <Sidebar
                        collapsed={false}
                        setCollapsed={() => { }}
                        mobile={true}
                        onClose={() => setCollapsed(false)}
                    />
                </Drawer>
            )}

            <Layout
                className="site-layout transition-all duration-200 ease-in-out"
                style={{
                    marginLeft: !isMobile ? 80 : 0
                }}
            >
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobile={isMobile}
                />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 16,
                        minHeight: 280,
                        backgroundColor: 'transparent', // Let background be decided by body or global
                    }}
                >
                    {/* Removed maxWidth to allow full width usage as requested, adjusted margins */}
                    <div style={{ width: '100%' }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
