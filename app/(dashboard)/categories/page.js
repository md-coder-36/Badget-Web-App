'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Tabs, List, Tag, Space, Typography, Tooltip, message, Popconfirm, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import CategoryForm from '@/components/forms/CategoryForm';
import SubcategoryForm from '@/components/forms/SubcategoryForm';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('expense');

    // Modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryFormLoading, setCategoryFormLoading] = useState(false);

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [parentCategoryForSub, setParentCategoryForSub] = useState(null);
    const [subFormLoading, setSubFormLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/categories?type=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            } else {
                message.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [activeTab]);

    // CATEGORY ACTIONS
    const handleCreateCategory = async (values) => {
        setCategoryFormLoading(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, type: activeTab }),
            });

            if (res.ok) {
                message.success('Category created successfully');
                setIsCategoryModalOpen(false);
                fetchCategories();
            } else {
                const err = await res.text();
                message.error(err || 'Failed to create category');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleUpdateCategory = async (values) => {
        setCategoryFormLoading(true);
        try {
            const res = await fetch(`/api/categories/${editingCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Category updated successfully');
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
                fetchCategories();
            } else {
                message.error('Failed to update category');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Category deleted');
                fetchCategories();
            } else {
                const err = await res.text(); // Capture generic error or validation message
                message.error(err || 'Failed to delete category');
            }
        } catch (error) {
            message.error('An error occurred');
        }
    };

    // SUBCATEGORY ACTIONS
    const handleCreateSubcategory = async (values) => {
        setSubFormLoading(true);
        try {
            const res = await fetch('/api/subcategories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, categoryId: parentCategoryForSub.id }),
            });

            if (res.ok) {
                message.success('Subcategory created');
                setIsSubModalOpen(false);
                setParentCategoryForSub(null);
                fetchCategories(); // Refresh to show new sub
            } else {
                message.error('Failed to create subcategory');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setSubFormLoading(false);
        }
    };

    const handleUpdateSubcategory = async (values) => {
        setSubFormLoading(true);
        try {
            const res = await fetch(`/api/subcategories/${editingSub.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Subcategory updated');
                setIsSubModalOpen(false);
                setEditingSub(null);
                fetchCategories();
            } else {
                message.error('Failed to update subcategory');
            }
        } catch (error) {
            message.error('An error occurred');
        } finally {
            setSubFormLoading(false);
        }
    };

    const handleDeleteSubcategory = async (id) => {
        try {
            const res = await fetch(`/api/subcategories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Subcategory deleted');
                fetchCategories();
            } else {
                const err = await res.text();
                message.error(err || 'Failed to delete subcategory');
            }
        } catch (error) {
            message.error('An error occurred');
        }
    };

    const renderCategoryList = () => (
        <List
            loading={loading}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={categories}
            renderItem={(category) => (
                <List.Item>
                    <Card
                        title={
                            <Space>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: category.color }} />
                                <Text strong>{category.name}</Text>
                                {category.isDefault && <Tag color="blue">Default</Tag>}
                            </Space>
                        }
                        extra={
                            <Space>
                                {!category.isDefault && (
                                    <Tooltip title="Edit Category">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            size="small"
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setIsCategoryModalOpen(true);
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {!category.isDefault && (
                                    <Popconfirm
                                        title="Delete this category?"
                                        description="This will fail if it has transactions."
                                        onConfirm={() => handleDeleteCategory(category.id)}
                                        okText="Yes"
                                        cancelText="No"
                                        disabled={category.isDefault}
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" disabled={category.isDefault} />
                                    </Popconfirm>
                                )}
                            </Space>
                        }
                        bodyStyle={{ padding: '0 12px 12px 12px' }}
                    >
                        <Space direction="vertical" className="w-full">
                            <Button
                                type="dashed"
                                block
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setParentCategoryForSub(category);
                                    setIsSubModalOpen(true);
                                }}
                            >
                                Add Subcategory
                            </Button>

                            {category.subcategories && category.subcategories.length > 0 && (
                                <List
                                    size="small"
                                    dataSource={category.subcategories}
                                    renderItem={sub => (
                                        <List.Item
                                            actions={[
                                                <EditOutlined key="edit" onClick={() => {
                                                    setEditingSub(sub);
                                                    setIsSubModalOpen(true);
                                                }} />,
                                                <Popconfirm
                                                    title="Delete subcategory?"
                                                    onConfirm={() => handleDeleteSubcategory(sub.id)}
                                                    key="del"
                                                >
                                                    <DeleteOutlined className="text-red-500" />
                                                </Popconfirm>
                                            ]}
                                        >
                                            <Text className="text-xs">{sub.name}</Text>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Space>
                    </Card>
                </List.Item>
            )}
        />
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Title level={2}>Categories</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingCategory(null);
                        setIsCategoryModalOpen(true);
                    }}
                >
                    Add Category
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                items={[
                    { key: 'expense', label: 'Expenses', children: renderCategoryList() },
                    { key: 'income', label: 'Income', children: renderCategoryList() }
                ]}
            />

            <CategoryForm
                open={isCategoryModalOpen}
                initialValues={editingCategory}
                loading={categoryFormLoading}
                onCancel={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                onCreate={editingCategory ? handleUpdateCategory : handleCreateCategory}
            />

            <SubcategoryForm
                open={isSubModalOpen}
                initialValues={editingSub}
                loading={subFormLoading}
                parentCategoryName={parentCategoryForSub?.name}
                onCancel={() => {
                    setIsSubModalOpen(false);
                    setEditingSub(null);
                    setParentCategoryForSub(null);
                }}
                onCreate={editingSub ? handleUpdateSubcategory : handleCreateSubcategory}
            />
        </div>
    );
}
