'use client';

import { Modal, Form, Input, ColorPicker, Select, Radio } from 'antd';
import { useEffect } from 'react';

export default function CategoryForm({ open, onCreate, onCancel, initialValues, loading }) {
    const [form] = Form.useForm();

    const isEdit = !!initialValues;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    color: initialValues.color || '#1890ff' // ensure color object/string compatibility
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    type: 'expense',
                    color: '#1890ff'
                });
            }
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            open={open}
            title={isEdit ? "Edit Category" : "Create New Category"}
            okText={isEdit ? "Update" : "Create"}
            cancelText="Cancel"
            onCancel={onCancel}
            confirmLoading={loading}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        // Ant Design ColorPicker returns an object, we need hex string
                        const colorHex = typeof values.color === 'string' ? values.color : values.color.toHexString();
                        onCreate({ ...values, color: colorHex });
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="category_form"
            >
                <Form.Item
                    name="name"
                    label="Category Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the name of the category!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                    className="collection-create-form_last-form-item"
                >
                    <Radio.Group disabled={isEdit}>
                        <Radio value="expense">Expense</Radio>
                        <Radio value="income">Income</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="color"
                    label="Color"
                >
                    <ColorPicker showText format="hex" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
