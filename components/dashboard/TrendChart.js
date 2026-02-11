'use client';

import { Column } from '@ant-design/charts';
import { Card, Empty, Spin } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function TrendChart({ period, refreshTrigger }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics/history?period=${period}`)
            .then(res => res.json())
            .then(data => {
                const transformed = [];
                data.forEach(item => {
                    transformed.push({
                        date: item.date,
                        type: 'Income',
                        value: item.income
                    });
                    transformed.push({
                        date: item.date,
                        type: 'Expense',
                        value: item.expense
                    });
                });
                setData(transformed);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [period, refreshTrigger]);

    const config = {
        data,
        isGroup: true,
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        // color: ({ type }) => {
        //     return type === 'Income' ? '#3f8600' : '#cf1322';
        // },
        marginRatio: 0.1,
        colorField: "type",
        style: {
            fill: ({ type }) => {
                return type === 'Income' ? '#2af1cdff' : '#ff3964ff';
            },
        },
        legend: {
            color: false,
        },
        xAxis: {
            label: {
                formatter: (val) => {
                    const d = dayjs(val);
                    if (val.length === 7) return d.format('MMM');
                    return d.format('DD/MM');
                }
            },
            title: {
                text: 'Date',
                style: { fontSize: 12 }
            }
        },
        yAxis: {
            label: {
                formatter: (v) => {
                    const val = Number(v);
                    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
                    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                }
            },
            title: {
                text: 'Amount (₹)',
                style: { fontSize: 12 }
            },
            // interaction: { tooltip: { shared: true } },
        }
    };


    return (
        <Card title="Income vs Expenses Trend" bordered={false} style={{ height: '100%' }}>
            {loading ? (
                <div className="flex justify-center items-center h-64"><Spin /></div>
            ) : data.length > 0 ? (
                <Column {...config} height={300} />
            ) : (
                <Empty description="No data for this period" />
            )}
        </Card>
    );
}
