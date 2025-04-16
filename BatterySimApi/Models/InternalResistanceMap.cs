// Models/InternalResistanceMap.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace BatterySimApi.Models
{
    public class InternalResistanceMap
    {
        private double[] socLevels;
        private double[] tempLevels;
        private double[,] resistanceTable;

        public void LoadFromCsv(string filePath)
        {
            var lines = File.ReadAllLines(filePath);
            tempLevels = lines[0].Split(',').Skip(1).Select(double.Parse).ToArray();

            var socList = new List<double>();
            var values = new List<double[]>();

            foreach (var line in lines.Skip(1))
            {
                var parts = line.Split(',');
                socList.Add(double.Parse(parts[0]));
                values.Add(parts.Skip(1).Select(double.Parse).ToArray());
            }

            socLevels = socList.ToArray();
            resistanceTable = new double[socLevels.Length, tempLevels.Length];

            for (int i = 0; i < socLevels.Length; i++)
                for (int j = 0; j < tempLevels.Length; j++)
                    resistanceTable[i, j] = values[i][j];
        }

        public double Interpolate(double soc, double temp)
        {
            soc = Math.Clamp(soc, socLevels.Min(), socLevels.Max());
            temp = Math.Clamp(temp, tempLevels.Min(), tempLevels.Max());

            // SOC index
            int i = Array.FindLastIndex(socLevels, s => s >= soc);
            int i2 = Math.Min(i + 1, socLevels.Length - 1);

            // Temp index
            int j = Array.FindLastIndex(tempLevels, t => t <= temp);
            int j2 = Math.Min(j + 1, tempLevels.Length - 1);

            // 2D 선형 보간 (bilinear interpolation)
            double t_soc = (soc - socLevels[i2]) / (socLevels[i] - socLevels[i2] + 1e-8);
            double t_temp = (temp - tempLevels[j]) / (tempLevels[j2] - tempLevels[j] + 1e-8);

            double r00 = resistanceTable[i, j];
            double r01 = resistanceTable[i, j2];
            double r10 = resistanceTable[i2, j];
            double r11 = resistanceTable[i2, j2];

            double r0 = r00 + t_temp * (r01 - r00);
            double r1 = r10 + t_temp * (r11 - r10);
            return r0 + t_soc * (r1 - r0);
        }
    }
}
