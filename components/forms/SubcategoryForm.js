'use client';

import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

export default function SubcategoryForm({ open, onCreate, onCancel, initialValues, parentCategoryName, loading }) {
    const [form] = Form.useForm();

    const isEdit = !!initialValues;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            open={open}
            title={isEdit ? "Edit Subcategory" : `Add Subcategory to ${parentCategoryName}`}
            okText={isEdit ? "Update" : "Create"}
            cancelText="Cancel"
            onCancel={onCancel}
            confirmLoading={loading}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        onCreate(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="subcategory_form"
            >
                <Form.Item
                    name="name"
                    label="Subcategory Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the name of the subcategory!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}
