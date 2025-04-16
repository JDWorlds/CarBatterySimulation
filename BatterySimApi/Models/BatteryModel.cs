// Models/BatteryModel.cs
using System;

namespace BatterySimApi.Models
{
    public class BatteryModel
    {
        private readonly OCVTable ocvTable;
        private readonly InternalResistanceMap resistanceMap;

        public double CapacityAh { get; set; } = 50.0;
        public double Soc { get; private set; } = 1.0;
        public double TemperatureC { get; private set; } = 25.0;
        public double Voltage { get; private set; }
        public double PowerLoss { get; private set; }

        public BatteryModel(OCVTable ocv, InternalResistanceMap resistance)
        {
            ocvTable = ocv;
            resistanceMap = resistance;
        }

        public double Step(double current, double dt)
        {
            // SOC 업데이트
            Soc -= (current * dt) / (CapacityAh * 3600);
            Soc = Math.Clamp(Soc, 0.0, 1.0);

            // OCV + 내부저항 계산
            double ocv = ocvTable.Interpolate(Soc);
            double r = resistanceMap.Interpolate(Soc, TemperatureC);

            // 전압 계산
            Voltage = ocv - current * r;
            PowerLoss = current * current * r;

            // 간단한 온도 상승 모델 (P_loss proportional)
            TemperatureC += PowerLoss * dt / 500.0; // 500은 가상의 열용량
            return Voltage;
        }
    }
}
