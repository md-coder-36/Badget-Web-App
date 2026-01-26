'use client';

import { Table, Tag, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function TransactionTable({ data, loading }) {

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (val) => dayjs(val).format('MMM DD, YYYY HH:mm'),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filters: [
                { text: 'Income', value: 'income' },
                { text: 'Expense', value: 'expense' },
            ],
            onFilter: (value, record) => record.type.indexOf(value) === 0,
            render: (type) => (
                <Tag icon={type === 'income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} color={type === 'income' ? 'success' : 'error'}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category',
            render: (text, record) => (
                <Space>
                    <Tag color={record.category?.color || 'default'}>{text}</Tag>
                    {record.subcategory && <Text type="secondary" style={{ fontSize: '12px' }}>({record.subcategory.name})</Text>}
                </Space>
            )
        },
        {
            title: 'Name/Notes',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex flex-col">
                    <Text strong>{text}</Text>
                    {record.notes && <Text type="secondary" style={{ fontSize: '12px' }}>{record.notes}</Text>}
                </div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val, record) => (
                <Text strong type={record.type === 'income' ? 'success' : 'danger'}>
                    {record.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)}
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            scroll={{ x: true }}
        />
    );
}
