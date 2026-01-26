'use client';

import { Pie } from '@ant-design/charts';
import { Card, Empty, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

export default function CategoryPieChart({ type, period, refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const endDate = new Date().toISOString();
        const startDateObj = new Date();
        if (period === '7d') startDateObj.setDate(startDateObj.getDate() - 7);
        else if (period === '30d') startDateObj.setDate(startDateObj.getDate() - 30);
        else if (period === '1y') startDateObj.setFullYear(startDateObj.getFullYear() - 1);
        const startDate = startDateObj.toISOString();

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
    }, [type, period, refreshTrigger]);

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
        <Card title={`${type === 'income' ? 'Income' : 'Expense'} Breakdown`} bordered={false} style={{ height: '100%' }}>
            {loading ? (
                <div className="flex justify-center items-center h-64"><Spin /></div>
            ) : data.length > 0 && data.some(d => d.value > 0) ? (
                <Pie {...config} height={300} />
            ) : (
                <Empty description="No data" />
            )}
        </Card>
    );
}
