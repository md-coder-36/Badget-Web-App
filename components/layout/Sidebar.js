'use client';

import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    WalletOutlined,
    TransactionOutlined,
    TagsOutlined,
    BarChartOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const { Sider } = Layout;

export default function Sidebar({ collapsed, setCollapsed, mobile, onClose }) {
    const pathname = usePathname();
    const router = useRouter();

    const items = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/income',
            icon: <WalletOutlined />,
            label: 'Income',
        },
        {
            key: '/expenses',
            icon: <TransactionOutlined />,
            label: 'Expenses',
        },
        {
            key: '/categories',
            icon: <TagsOutlined />,
            label: 'Categories',
        },
        {
            key: '/reports',
            icon: <BarChartOutlined />,
            label: 'Reports',
        },
    ];

    const handleMenuClick = ({ key }) => {
        router.push(key);
        if (mobile && onClose) onClose();
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            collapsedWidth={mobile ? 0 : 80}
            width={250}
            style={mobile ? { height: '100%', border: 'none' } : {
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100, // Ensure it's above content
            }}
            theme="light"
        >
            <div className="flex items-center justify-center h-16 px-2 bg-green-100 border border-green-200">
                <span className={`text-black uppercase font-bold text-xl ${collapsed ? 'hidden' : 'block'}`}>
                    Budget App
                </span>
                <span className={`text-black uppercase font-bold text-xl ${collapsed ? 'block' : 'hidden'}`}>
                    BA
                </span>
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[pathname]}
                items={items}
                onClick={handleMenuClick}
            />
            {/* Sign Out Button at bottom */}
            <div className="absolute bottom-4 w-full px-4">
                <div
                    className="flex items-center justify-center gap-2 text-black uppercase font-bold cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => signOut()}
                >
                    <LogoutOutlined />
                    {!collapsed && <span>Sign Out</span>}
                </div>
            </div>
        </Sider>
    );
}
