// Models/OCVTable.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace BatterySimApi.Models
{
    public class OCVTable
    {
        private readonly List<(double soc, double ocv)> table = new();

        public void LoadFromCsv(string filePath)
        {
            var lines = File.ReadAllLines(filePath);
            foreach (var line in lines.Skip(1)) // skip header
            {
                var parts = line.Split(',');
                if (parts.Length >= 2 &&
                    double.TryParse(parts[0], out double soc) &&
                    double.TryParse(parts[1], out double ocv))
                {
                    table.Add((soc, ocv));
                }
            }

            // SOC 내림차순 정렬 (1.0 → 0.0)
            table.Sort((a, b) => b.soc.CompareTo(a.soc));
        }

        public double Interpolate(double soc)
        {
            if (table.Count == 0)
                throw new InvalidOperationException("OCV 테이블이 비어 있습니다.");

            soc = Math.Clamp(soc, 0.0, 1.0);

            for (int i = 0; i < table.Count - 1; i++)
            {
                var (soc1, ocv1) = table[i];
                var (soc2, ocv2) = table[i + 1];

                if (soc <= soc1 && soc >= soc2)
                {
                    // 선형 보간
                    double t = (soc - soc2) / (soc1 - soc2);
                    return ocv2 + t * (ocv1 - ocv2);
                }
            }

            // 경계값 처리
            return table.Last().ocv;
        }
    }
}
