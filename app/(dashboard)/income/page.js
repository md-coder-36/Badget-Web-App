'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Typography, Tooltip, message, Popconfirm, Statistic, Row, Col, DatePicker, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import IncomeForm from '@/components/forms/IncomeForm';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function IncomePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Filters
    const [dateRange, setDateRange] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formLoading, setFormLoading] = useState(false);

    // Fetch Categories for Filter
    useEffect(() => {
        fetch('/api/categories?type=income')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    const fetchIncome = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange && dateRange[0]) {
                params.append('startDate', dateRange[0].toISOString());
                params.append('endDate', dateRange[1].toISOString());
            }
            if (selectedCategory) {
                params.append('categoryId', selectedCategory);
            }

            const res = await fetch(`/api/income?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                message.error('Failed to fetch income data');
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncome();
    }, [dateRange, selectedCategory]);

    const handleCreate = async (values) => {
        setFormLoading(true);
        try {
            const res = await fetch('/api/income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Income added successfully');
                setIsModalOpen(false);
                fetchIncome();
            } else {
                const err = await res.text();
                message.error(err || 'Failed to add income');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        setFormLoading(true);
        try {
            const res = await fetch(`/api/income/${editingItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Income updated successfully');
                setIsModalOpen(false);
                setEditingItem(null);
                fetchIncome();
            } else {
                message.error('Failed to update income');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/income/${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Income deleted');
                fetchIncome();
            } else {
                message.error('Failed to delete income');
            }
        } catch (error) {
            message.error('An error occurred');
        }
    };

    const totalIncome = data.reduce((sum, item) => sum + Number(item.amount), 0);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (val) => dayjs(val).format('MMM DD, YYYY'),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => (
                <Text type="success" strong>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)}
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Category',
            dataIndex: ['category', 'name'],
            key: 'category',
            render: (text, record) => (
                <Tag color={record.category?.color || 'blue'}>{text}</Tag>
            ),
        },
        {
            title: 'Subcategory',
            dataIndex: ['subcategory', 'name'],
            key: 'subcategory',
            render: (text) => text || '-',
        },
        {
            title: 'Frequency',
            dataIndex: 'frequency',
            key: 'frequency',
            render: (text) => <Tag>{text}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditingItem(record);
                                setIsModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this entry?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title level={2}>Income Management</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingItem(null);
                        setIsModalOpen(true);
                    }}
                >
                    Add Income
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={24}>
                    <Card>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <Space wrap>
                                <RangePicker
                                    onChange={(dates) => setDateRange(dates)}
                                    allowClear
                                />
                                <Select
                                    placeholder="Filter by Category"
                                    style={{ width: 200 }}
                                    allowClear
                                    onChange={setSelectedCategory}
                                >
                                    {categories.map(c => (
                                        <Option key={c.id} value={c.id}>{c.name}</Option>
                                    ))}
                                </Select>
                                <Button icon={<ReloadOutlined />} onClick={fetchIncome}>Refresh</Button>
                            </Space>

                            <Statistic
                                title="Total Income"
                                value={totalIncome}
                                precision={2}
                                prefix="₹"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </div>

                        <Table
                            columns={columns}
                            dataSource={data}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
            </Row>

            <IncomeForm
                open={isModalOpen}
                initialValues={editingItem}
                loading={formLoading}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onCreate={editingItem ? handleUpdate : handleCreate}
            />
        </div>
    );
}
