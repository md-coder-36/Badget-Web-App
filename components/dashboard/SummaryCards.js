'use client';

import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, BankOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function SummaryCards({ period, refreshTrigger }) {
    const [data, setData] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        savingsRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Calculate dates based on period
        const endDate = new Date().toISOString();
        const startDateObj = new Date();

        if (period === '7d') startDateObj.setDate(startDateObj.getDate() - 7);
        else if (period === '30d') startDateObj.setDate(startDateObj.getDate() - 30);
        else if (period === '1y') startDateObj.setFullYear(startDateObj.getFullYear() - 1);

        const startDate = startDateObj.toISOString();

        fetch(`/api/analytics/summary?startDate=${startDate}&endDate=${endDate}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [period, refreshTrigger]);

    const formatter = (value) => <span className="text-xl lg:text-2xl">{value}</span>;

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} loading={loading}>
                    <Statistic
                        title="Total Income"
                        value={data.totalIncome}
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                        prefix="₹"
                        suffix={<ArrowUpOutlined />}
                        formatter={val => new Intl.NumberFormat('en-IN').format(val)}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} loading={loading}>
                    <Statistic
                        title="Total Expenses"
                        value={data.totalExpenses}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                        prefix="₹"
                        suffix={<ArrowDownOutlined />}
                        formatter={val => new Intl.NumberFormat('en-IN').format(val)}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} loading={loading}>
                    <Statistic
                        title="Net Balance"
                        value={data.netBalance}
                        precision={2}
                        valueStyle={{ color: data.netBalance >= 0 ? '#3f8600' : '#cf1322' }}
                        suffix={<WalletOutlined />}
                        formatter={val => `₹ ${new Intl.NumberFormat('en-IN').format(val)} `}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} loading={loading}>
                    <Statistic
                        title="Savings Rate"
                        value={data.savingsRate}
                        precision={1}
                        valueStyle={{ color: data.savingsRate >= 20 ? '#3f8600' : '#faad14' }}
                        suffix="%"
                        prefix={<BankOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
}
