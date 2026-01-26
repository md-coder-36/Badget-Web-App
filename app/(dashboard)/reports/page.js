'use client';

import { useState, useEffect } from 'react';
import { Typography, DatePicker, Button, Tabs, Card, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import TransactionTable from '@/components/reports/TransactionTable';
import CategoryAnalysis from '@/components/reports/CategoryAnalysis';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ReportsPage() {
    // Default to current month
    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('transactions');

    const fetchTransactions = async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return;

        setLoading(true);
        try {
            const start = dateRange[0].toISOString();
            const end = dateRange[1].toISOString();

            const res = await fetch(`/api/transactions?startDate=${start}&endDate=${end}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [dateRange]);

    const handleExportCSV = () => {
        if (!transactions.length) return;

        const headers = ['Date', 'Type', 'Category', 'Subcategory', 'Name', 'Amount', 'Notes'];
        const rows = transactions.map(t => [
            dayjs(t.date).format('YYYY-MM-DD HH:mm'),
            t.type,
            t.category?.name || '',
            t.subcategory?.name || '',
            `"${t.name}"`, // Quote to handle commas in name
            t.amount,
            `"${t.notes || ''}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `budget_report_${dayjs().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Title level={2} style={{ margin: 0 }}>Reports & Analysis</Title>
                <Space wrap>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        allowClear={false}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchTransactions}
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportCSV}
                        disabled={transactions.length === 0}
                    >
                        Export CSV
                    </Button>
                </Space>
            </div>

            <Card bordered={false}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'transactions',
                            label: 'Detailed Transactions',
                            children: <TransactionTable data={transactions} loading={loading} />
                        },
                        {
                            key: 'analysis',
                            label: 'Category Analysis',
                            children: <CategoryAnalysis
                                startDate={dateRange[0]?.toISOString()}
                                endDate={dateRange[1]?.toISOString()}
                            />
                        }
                    ]}
                />
            </Card>
        </div>
    );
}
