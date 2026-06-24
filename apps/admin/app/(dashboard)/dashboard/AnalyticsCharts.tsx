'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsCharts({
  bookingsOverTime,
  revenueByLocation,
}: {
  bookingsOverTime: { date: string; count: number; revenue: number }[];
  revenueByLocation: { city: string; revenue: number }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 24, height: 320 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, height: 300 }} />
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, height: 300 }} />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: 16, 
      marginTop: 24 
    }}>
      <div style={{ 
        background: '#FFFFFF', 
        border: '1px solid #E5E7EB', 
        borderRadius: 12, 
        padding: 20 
      }}>
        <h3 style={{ marginBottom: 16, color: '#111827', fontSize: '15px', fontWeight: 600 }}>
          Bookings Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={bookingsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
            <Line type="monotone" dataKey="count" stroke="#1A6B5A" strokeWidth={2} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        background: '#FFFFFF', 
        border: '1px solid #E5E7EB', 
        borderRadius: 12, 
        padding: 20 
      }}>
        <h3 style={{ marginBottom: 16, color: '#111827', fontSize: '15px', fontWeight: 600 }}>
          Revenue by Location
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueByLocation}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="city" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#D4704A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
