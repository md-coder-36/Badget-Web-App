'use client';

import { Row, Col, Typography } from 'antd';
import { Pie } from '@ant-design/charts';
import { Card, Empty, Spin } from 'antd';
import { useEffect, useState } from 'react';

export default function CategoryAnalysis({ startDate, endDate }) {

    const CategoryReportChart = ({ type, startDate, endDate }) => {
        const [data, setData] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (!startDate || !endDate) return;
            setLoading(true);
            fetch(`/api/analytics/categories?type=${type}&startDate=${startDate}&endDate=${endDate}`)
                .then(res => res.json())
                .then(data => {
                    const totalVal = data.reduce((acc, curr) => acc + Number(curr.value), 0);
                    setData(data.map((d) => ({
                        ...d,
                        value: Number(d.value),
                        weight: totalVal ? (Number(d.value) / totalVal).toFixed(2) : 0,
                    })));
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }, [type, startDate, endDate]);

        const total = data.reduce((acc, curr) => acc + curr.value, 0);

        const config = {
            data,
            angleField: 'value',
            colorField: 'name',
            innerRadius: 0.6,
            label: [
                {
                    text: ({ name, value }) => {
                        return `${name} (₹${new Intl.NumberFormat('en-IN', { notation: "compact" }).format(value)})`;
                    },
                    style: {
                        fontSize: 14,
                        fontWeight: 'bold',
                        fill: '#000',
                    },
                    position: 'spider',
                },
                {
                    text: ({ weight }) => {
                        return `${parseInt(weight * 100)}%`;
                    },
                    style: {
                        fontSize: 12,
                        fontWeight: 'bold',
                        fill: '#000',
                    },
                },
            ],
            annotations: [
                {
                    type: 'text',
                    style: {
                        text: `₹${new Intl.NumberFormat('en-IN', { notation: "compact" }).format(total)}`,
                        x: '50%',
                        y: '50%',
                        textAlign: 'center',
                        fontStyle: 'bold',
                        fontSize: 32,
                    },
                },
            ],
            legend: {
                color: false,
            },
            tooltip: ({ value }) => {
                return `₹${new Intl.NumberFormat('en-IN', { notation: "standard" }).format(value)}`;
            },
            interactions: [
                { type: 'element-active' },
            ],
        };

        return (
            <Card title={`${type === 'income' ? 'Income' : 'Expense'} Analysis`} bordered={false}>
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Spin /></div>
                ) : data.length > 0 && data.some(d => d.value > 0) ? (
                    <Pie {...config} height={350} />
                ) : (
                    <Empty description="No data" />
                )}
            </Card>
        );
    };

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
                <CategoryReportChart type="expense" startDate={startDate} endDate={endDate} />
            </Col>
            <Col xs={24} md={12}>
                <CategoryReportChart type="income" startDate={startDate} endDate={endDate} />
            </Col>
        </Row>
    );
}
