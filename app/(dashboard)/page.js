'use client';

import { useState } from 'react';
import { Typography, Row, Col, Select, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TrendChart from '@/components/dashboard/TrendChart';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DashboardPage() {
    const [period, setPeriod] = useState('7d');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
                    <Text type="secondary">Overview of your financial health</Text>
                </div>
                <Space>
                    <Select
                        defaultValue="7d"
                        style={{ width: 120 }}
                        onChange={setPeriod}
                    >
                        <Option value="7d">Last 7 Days</Option>
                        <Option value="30d">Last 30 Days</Option>
                        <Option value="1y">Last Year</Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Refresh
                    </Button>
                </Space>
            </div>

            <SummaryCards period={period} refreshTrigger={refreshTrigger} />

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <TrendChart period={period} refreshTrigger={refreshTrigger} />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <CategoryPieChart type="expense" period={period} refreshTrigger={refreshTrigger} />
                </Col>
                <Col xs={24} md={12}>
                    <CategoryPieChart type="income" period={period} refreshTrigger={refreshTrigger} />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <RecentTransactions refreshTrigger={refreshTrigger} />
                </Col>
            </Row>
        </div>
    );
}
