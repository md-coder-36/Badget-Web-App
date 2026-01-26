'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, DollarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                message.error('Invalid email or password');
            } else {
                message.success('Login successful!');
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            message.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <div className="text-center mb-6">
                <DollarOutlined className="text-5xl text-blue-500 mb-3" />
                <Title level={2} className="mb-2">Welcome Back!</Title>
                <Text type="secondary">Sign in to manage your budget</Text>
            </div>

            <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
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
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        autoComplete="current-password"
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
                        Sign In
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>Don't have an account?</Divider>

            <Link href="/register">
                <Button block size="large">
                    Create Account
                </Button>
            </Link>
        </Card>
    );
}
