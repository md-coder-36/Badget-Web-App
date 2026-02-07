'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Typography, Tooltip, message, Popconfirm, Statistic, Row, Col, DatePicker, Select, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ExpenseForm from '@/components/forms/ExpenseForm';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ExpensesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Filters
    const [dateRange, setDateRange] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Note View State
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState('');

    const [formLoading, setFormLoading] = useState(false);

    // Fetch Categories for Filter
    useEffect(() => {
        fetch('/api/categories?type=expense')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    const fetchExpenses = async () => {
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
            if (selectedPaymentMethod) {
                params.append('paymentMethod', selectedPaymentMethod);
            }

            const res = await fetch(`/api/expenses?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                message.error('Failed to fetch expenses');
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [dateRange, selectedCategory, selectedPaymentMethod]);

    const handleCreate = async (values) => {
        setFormLoading(true);
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Expense added successfully');
                setIsModalOpen(false);
                fetchExpenses();
            } else {
                const err = await res.text();
                message.error(err || 'Failed to add expense');
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
            const res = await fetch(`/api/expenses/${editingItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Expense updated successfully');
                setIsModalOpen(false);
                setEditingItem(null);
                fetchExpenses();
            } else {
                message.error('Failed to update expense');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Expense deleted');
                fetchExpenses();
            } else {
                message.error('Failed to delete expense');
            }
        } catch (error) {
            message.error('An error occurred');
        }
    };

    const totalExpenses = data.reduce((sum, item) => sum + Number(item.amount), 0);

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
                <Text type="danger" strong>
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
                <Tag color={record.category?.color || 'red'}>{text}</Tag>
            ),
        },
        {
            title: 'Subcategory',
            dataIndex: ['subcategory', 'name'],
            key: 'subcategory',
            render: (text) => text || '-',
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (text) => {
                const colors = {
                    cash: 'green',
                    credit_card: 'blue',
                    debit_card: 'cyan',
                    online: 'purple',
                    other: 'default'
                };
                return <Tag color={colors[text] || 'default'}>{text?.replace('_', ' ').toUpperCase()}</Tag>
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Notes">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                setSelectedNote(record.notes || 'No notes available.');
                                setNoteModalVisible(true);
                            }}
                        />
                    </Tooltip>
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
                <Title level={2}>Expense Management</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingItem(null);
                        setIsModalOpen(true);
                    }}
                >
                    Add Expense
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
                                    placeholder="Category"
                                    style={{ width: 150 }}
                                    allowClear
                                    onChange={setSelectedCategory}
                                >
                                    {categories.map(c => (
                                        <Option key={c.id} value={c.id}>{c.name}</Option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Payment Method"
                                    style={{ width: 150 }}
                                    allowClear
                                    onChange={setSelectedPaymentMethod}
                                >
                                    <Option value="cash">Cash</Option>
                                    <Option value="credit_card">Credit Card</Option>
                                    <Option value="debit_card">Debit Card</Option>
                                    <Option value="online">Online</Option>
                                </Select>
                                <Button icon={<ReloadOutlined />} onClick={fetchExpenses}>Refresh</Button>
                            </Space>

                            <Statistic
                                title="Total Expenses"
                                value={totalExpenses}
                                precision={2}
                                prefix="₹"
                                valueStyle={{ color: '#cf1322' }}
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

            <ExpenseForm
                open={isModalOpen}
                initialValues={editingItem}
                loading={formLoading}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onCreate={editingItem ? handleUpdate : handleCreate}
            />

            <Modal
                title="Notes"
                open={noteModalVisible}
                onCancel={() => setNoteModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setNoteModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                <p>{selectedNote}</p>
            </Modal>
        </div>
    );
}
