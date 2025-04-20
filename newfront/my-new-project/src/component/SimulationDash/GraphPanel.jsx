import React from "react";
import * as XLSX from "xlsx";
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

export default function GraphPanel({ graphs, data, metrics, yAxisSettings, onDownloadExcel, onYAxisDoubleClick }) {
  return (
    <div>
      <div className="text-center mb-6">
        <button
          onClick={onDownloadExcel}
          className="px-6 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
        >
          엑셀 다운로드
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {graphs.map((graph) => (
          <div key={graph.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{graph.title || `그래프 ${graph.id}`}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                {graph.metrics.map((metricKey) => {
                  const metric = metrics.find((m) => m.key === metricKey);
                  const settings = yAxisSettings[metricKey] || {};
                  const ticks = [];
                  if (
                    settings.min !== undefined &&
                    settings.max !== undefined &&
                    settings.interval !== undefined &&
                    settings.interval > 0
                  ) {
                    for (let i = settings.min; i <= settings.max; i += settings.interval) {
                      ticks.push(i);
                    }
                  }
                  return (
                    <YAxis
                      key={metric.key}
                      yAxisId={metric.yAxisId} // 고유 Y축 ID
                      domain={[
                        settings.min !== undefined ? settings.min : "auto",
                        settings.max !== undefined ? settings.max : "auto",
                      ]}
                      ticks={ticks.length > 0 ? ticks : undefined}
                      label={{
                        value: metric.label,
                        angle: -90,
                        position: "insideLeft",
                      }}
                      onDoubleClick={() => onYAxisDoubleClick(metric.key)} // 더블 클릭 이벤트
                    />
                  );
                })}
                <Tooltip />
                <Legend />
                {graph.metrics.map((metricKey) => {
                  const metric = metrics.find((m) => m.key === metricKey);
                  return (
                    <Line
                      key={metric.key}
                      yAxisId={metric.yAxisId} // Y축 ID와 연결
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      name={metric.label}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}