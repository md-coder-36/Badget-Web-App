'use client';

import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export default function IncomeForm({ open, onCreate, onCancel, initialValues, loading }) {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const isEdit = !!initialValues;

    // Fetch income categories on mount
    useEffect(() => {
        fetch('/api/categories?type=income')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Find selected category to populate subcategories
                const selectedCat = categories.find(c => c.id === initialValues.categoryId);
                if (selectedCat) setSubcategories(selectedCat.subcategories || []);

                form.setFieldsValue({
                    ...initialValues,
                    date: dayjs(initialValues.date),
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    date: dayjs(),
                    frequency: 'one-time'
                });
                setSubcategories([]);
            }
        }
    }, [open, initialValues, form, categories]);

    const handleCategoryChange = (val) => {
        const selectedCat = categories.find(c => c.id === val);
        setSubcategories(selectedCat ? selectedCat.subcategories : []);
        form.setFieldValue('subcategoryId', undefined);
    };

    return (
        <Modal
            open={open}
            title={isEdit ? "Edit Income" : "Add New Income"}
            okText={isEdit ? "Update" : "Add"}
            cancelText="Cancel"
            onCancel={onCancel}
            confirmLoading={loading}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        onCreate({
                            ...values,
                            date: values.date.format('YYYY-MM-DD'), // Standardize date format
                        });
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="income_form"
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input a name!' }]}
                >
                    <Input placeholder="e.g. Salary, Client Payment" />
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: 'Please input an amount!' }]}
                >
                    <InputNumber
                        className="w-full"
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                        min={0}
                        precision={2}
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category!' }]}
                    >
                        <Select onChange={handleCategoryChange}>
                            {categories.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="subcategoryId"
                        label="Subcategory"
                    >
                        <Select disabled={subcategories.length === 0}>
                            {subcategories.map(s => (
                                <Option key={s.id} value={s.id}>{s.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: 'Please select a date!' }]}
                    >
                        <DatePicker className="w-full" format="MMM DD, YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="frequency"
                        label="Frequency"
                    >
                        <Select>
                            <Option value="one-time">One-time</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="bi-weekly">Bi-weekly</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="yearly">Yearly</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
