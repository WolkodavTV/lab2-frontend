"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Інтерфейс для алерту освітлення
interface LightAlert {
  message: string;
  lightLevel: number;
  sensorName: string;
  timestamp: string;
  severity: 'critical' | 'warning';
}

interface Reading {
  time: string;
  value: number;
}

export default function DashboardLightPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Стан для зберігання алертів
  const [alerts, setAlerts] = useState<LightAlert[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Отримання даних для графіка (старий useEffect)
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiUrl}/light-sensors`); 
        if (!res.ok) throw new Error("Error fetching data");
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString("uk-UA", {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }),
          value: item.value,
        }));
        setReadings(formatted.reverse());
      } catch (error) {
        console.error("Fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Новий useEffect для підключення до SSE та прослуховування алертів
  useEffect(() => {
    if (!apiUrl) return;
    const eventSource = new EventSource(`${apiUrl}/light-sensors/alerts`);

    eventSource.onmessage = (event) => {
      const alert: LightAlert = JSON.parse(event.data);
      // Додаємо новий алерт і обмежуємо історію до 5 останніх
      setAlerts((prev) => [alert, ...prev].slice(0, 5));
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  if (loading) return <p className="p-6">Завантаження даних...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Графік сенсора освітлення 💡</h1>
      
      {/* Блок для відображення алертів */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md"
              role="alert"
            >
              <p className="font-bold">⚠️ {alert.message}</p>
              <p className="text-sm">
                Давач: {alert.sensorName} | Час:{" "}
                {new Date(alert.timestamp).toLocaleTimeString("uk-UA")}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <h2 className="text-lg font-medium mb-4">Light Sensor A (Lux)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2} dot={true} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}