'use client';

import { List, Avatar, Tag, Typography, Card, Empty, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function RecentTransactions({ refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/analytics/recent')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [refreshTrigger]);

    return (
        <Card title="Recent Transactions" bordered={false} style={{ height: '100%' }}>
            {loading ? (
                <div className="flex justify-center items-center h-64"><Spin /></div>
            ) : data.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        style={{ backgroundColor: item.type === 'income' ? '#f6ffed' : '#fff1f0' }}
                                        icon={
                                            item.type === 'income'
                                                ? <ArrowUpOutlined style={{ color: '#3f8600' }} />
                                                : <ArrowDownOutlined style={{ color: '#cf1322' }} />
                                        }
                                    />
                                }
                                title={<Text strong>{item.name}</Text>}
                                description={
                                    <div className="flex gap-2 text-xs">
                                        <span>{dayjs(item.date).format('MMM DD')}</span>
                                        <Tag color={item.category?.color || 'default'} className="m-0 text-[10px] h-5 leading-4 px-1">{item.category?.name}</Tag>
                                    </div>
                                }
                            />
                            <div className="flex flex-col items-end">
                                <Text strong type={item.type === 'income' ? 'success' : 'danger'}>
                                    {item.type === 'income' ? '+' : '-'}
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.amount)}
                                </Text>
                            </div>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="No recent transactions" />
            )}
        </Card>
    );
}
