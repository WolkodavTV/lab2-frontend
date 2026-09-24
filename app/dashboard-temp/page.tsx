"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Reading {
  time: string;
  value: number;
}

export default function DashboardTempPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiUrl}/sensors`); // Звернення до контролера температури
        if (!res.ok) throw new Error("Error fetching data");
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString("uk-UA", {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }),
          value: item.value,
        }));
        setReadings(formatted);
      } catch (error) {
        console.error("Fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000); // Оновлення кожні 10 секунд
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (loading) return <p className="p-6">Завантаження даних...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Графік температурного сенсора 🌡</h1>
      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <h2 className="text-lg font-medium mb-4">Sensor A</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={true} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}