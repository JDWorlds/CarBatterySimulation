import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SimulationDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulation")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
        console.log("Fetched data:", json);
      })
      .catch((err) => {
        console.error("API fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">🚘 주행 시뮬레이션 & 🔋 배터리 상태</h1>

      {loading ? (
        <p>데이터를 불러오는 중입니다...</p>
      ) : (       
      <>
          <div>
            <h2 className="text-xl font-semibold mb-2">🚗 주행 시뮬레이션</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "시간 (s)", position: "insideBottomRight", offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: "속도 (km/h)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "전류 (A)", angle: -90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#8884d8" name="속도" />
                <Line yAxisId="right" type="monotone" dataKey="current" stroke="#82ca9d" name="전류" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-6 mb-2">🔋 배터리 상태</h2>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "시간 (s)", position: "insideBottomRight", offset: -5 }} />
                <YAxis yAxisId="voltage" label={{ value: "전압 (V)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="soc" orientation="right" label={{ value: "SOC (%)", angle: -90, position: "insideRight" }} />
                <YAxis yAxisId="temp" orientation="right" label={{ value: "온도 (℃)", angle: -90, position: "outsideRight" }} offset={80} />
                <Tooltip />
                <Legend />
                <Line yAxisId="voltage" type="monotone" dataKey="voltage" stroke="#ff7300" name="전압" />
                <Line yAxisId="soc" type="monotone" dataKey="soc" stroke="#387908" name="SOC (%)" />
                <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#888" name="온도 (℃)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
