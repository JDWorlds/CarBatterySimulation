import React, { useState, useEffect } from "react";
import FilterPanel from "./FilterPanel";
import GraphPanel from "./GraphPanel";
import * as XLSX from "xlsx";

function YAxisPopup({ metricKey, settings, onChange, onClose }) {
  if (!metricKey) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Y축 설정: {metricKey}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">최소값</label>
            <input
              type="number"
              value={settings.min !== undefined && settings.min !== null ? settings.min : ""}
              onChange={(e) => onChange(metricKey, "min", Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">최대값</label>
            <input
              type="number"
              value={settings.max !== undefined && settings.max !== null ? settings.max : ""}
              onChange={(e) => onChange(metricKey, "max", Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">간격</label>
            <input
              type="number"
              value={settings.interval !== undefined && settings.interval !== null ? settings.interval : ""}
              onChange={(e) => onChange(metricKey, "interval", Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SimulationDashboard() {
  const [data, setData] = useState([]);
  const [graphs, setGraphs] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(["speed", "current"]);
  const [yAxisSettings, setYAxisSettings] = useState({
    speed: { min: 0, max: 200, interval: 20 },
    current: { min: 0, max: 100, interval: 10 },
    voltage: { min: 0, max: 500, interval: 50 },
    soc: { min: 0, max: 100, interval: 10 },
    temperature: { min: -20, max: 100, interval: 10 },
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(null);

  const metrics = [
    { key: "speed", label: "속도 (km/h)", color: "#8884d8", yAxisId: "left" },
    { key: "current", label: "전류 (A)", color: "#82ca9d", yAxisId: "right" },
    { key: "voltage", label: "전압 (V)", color: "#ff7300", yAxisId: "voltage" },
    { key: "soc", label: "SOC (%)", color: "#387908", yAxisId: "soc" },
    { key: "temperature", label: "온도 (℃)", color: "#888", yAxisId: "temp" },
  ];

  useEffect(() => {
    fetch("/api/simulation")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("API fetch error:", err));
  }, []);

  const handleMetricChange = (metricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricKey)
        ? prev.filter((key) => key !== metricKey)
        : [...prev, metricKey]
    );
  };

  const handleGenerateGraph = () => {
    const graphTitle = selectedMetrics.map((key) => metrics.find((m) => m.key === key)?.label).join(", ");
    setGraphs((prev) => [...prev, { id: prev.length + 1, metrics: selectedMetrics, title: graphTitle }]);
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    graphs.forEach((graph) => {
      const sanitizedTitle = (graph.title || `Graph ${graph.id}`).replace(/[:\\\/\?\*\[\]]/g, "");
      const sheetData = data.map((row) => {
        const filteredRow = { time: row.time };
        graph.metrics.forEach((metricKey) => {
          filteredRow[metricKey] = row[metricKey];
        });
        return filteredRow;
      });
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedTitle);
    });
    XLSX.writeFile(workbook, "simulation_data.xlsx");
  };

  const handleYAxisChange = (metricKey, field, value) => {
    setYAxisSettings((prev) => ({
      ...prev,
      [metricKey]: {
        ...prev[metricKey],
        [field]: value,
      },
    }));
  };

  const openYAxisPopup = (metricKey) => {
    setCurrentMetric(metricKey);
    setPopupVisible(true);
  };

  const closeYAxisPopup = () => {
    setPopupVisible(false);
    setCurrentMetric(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl">
        <FilterPanel
          metrics={metrics}
          selectedMetrics={selectedMetrics}
          onMetricChange={handleMetricChange}
          onGenerateGraph={handleGenerateGraph}
          yAxisSettings={yAxisSettings}
          onYAxisChange={handleYAxisChange}
        />
        <GraphPanel
          graphs={graphs}
          data={data}
          metrics={metrics}
          yAxisSettings={yAxisSettings}
          onDownloadExcel={handleDownloadExcel}
          onYAxisDoubleClick={openYAxisPopup}
        />
      </div>
      {popupVisible && (
        <YAxisPopup
          metricKey={currentMetric}
          settings={yAxisSettings[currentMetric]}
          onChange={handleYAxisChange}
          onClose={closeYAxisPopup}
        />
      )}
    </div>
  );
}
