'use client';

import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header({ collapsed, setCollapsed, mobile }) {
    const { data: session } = useSession();

    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    const items = [
        {
            key: '1',
            label: (
                <div className="px-1 py-1">
                    <Text strong>{session?.user?.name || 'User'}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{session?.user?.email}</Text>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sign Out',
            danger: true,
            onClick: () => signOut({ callbackUrl: '/login' }),
        },
    ];

    return (
        <AntHeader
            className="bg-white  flex items-center justify-between sticky top-0 z-20 shadow-sm"
            style={{ paddingLeft: 16, paddingRight: 24, }}
        >
            <div className="flex items-center">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '20px',
                        width: 50,
                        height: 50,
                    }}
                />
                {mobile && (
                    <Text strong className="text-lg ml-2">
                        Budget App
                    </Text>
                )}
            </div>

            <div className="flex items-center">
                <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                    <Space className="cursor-pointer hover:bg-gray-100 px-4 h-12 rounded-xl transition-colors">
                        <Avatar
                            className="bg-primary"
                            style={{ backgroundColor: '#1890ff' }}
                        >
                            {userInitials}
                        </Avatar>
                        {!mobile && (
                            <Text strong className="hidden sm:block">
                                {session?.user?.name || session?.user?.email?.split('@')[0]}
                            </Text>
                        )}
                    </Space>
                </Dropdown>
            </div>
        </AntHeader>
    );
}
