'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, DollarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                message.error(data.error || 'Registration failed');
                return;
            }

            message.success('Account created successfully! Please sign in.');
            router.push('/login');
        } catch (error) {
            message.error('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <div className="text-center mb-6">
                <DollarOutlined className="text-5xl text-blue-500 mb-3" />
                <Title level={2} className="mb-2">Create Account</Title>
                <Text type="secondary">Start managing your budget today</Text>
            </div>

            <Form
                name="register"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Full Name"
                        autoComplete="name"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email"
                        autoComplete="email"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Please enter a password' },
                        { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password (min 8 characters)"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                    >
                        Create Account
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>Already have an account?</Divider>

            <Link href="/login">
                <Button block size="large">
                    Sign In
                </Button>
            </Link>
        </Card>
    );
}
