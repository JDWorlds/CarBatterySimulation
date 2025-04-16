using System;

namespace BatterySimApi.Models
{
    public class VehicleModel
    {
        // 차량 모델의 속성
        public double Mass {get; set;} = 1500; //kg
        public double WheelRadius {get; set;} = 1500;
        public double GearRatio {get; set;} = 1500;
        public double DrivetrainEfficiency {get; set;} = 1500;
        public double MaxMotorTorque {get; set;} = 1500;
        public double RegenTorqueLimit {get; set;} = 1500;

        // 차량 외부환경 상수 지정
        public double Cd {get; set;} = 0.3; // 공기 저항 계수
        public double Cr {get; set;} = 0.01; // 구름 저항 계수
        public double FrontalArea {get; set;} = 2.5; // 차량 정면 면적
        public double AirDensity {get; set;} = 1.225; // 공기 밀도
        public double SlopeAngleDeg {get; set;} = 0; // 경사각도

        private double lastspeed = 0;

        public double ComputeRequiredCurrent(double speedKmh, double dt, double vbat)
        {
            double v = speedKmh / 3.6; // km/h to m/s
            double a = (v - lastspeed) / dt; // m/s^2
            double slope = Math.Sin(SlopeAngleDeg * Math.PI / 180); // 경사각도

            double fRoll = Mass * 9.81 * Cr * Math.Cos(SlopeAngleDeg * Math.PI / 180); // 구름 저항력
            double fAreo = 0.5 * Cd * FrontalArea * AirDensity * v * v; // 공기 저항력
            double fslope = Mass * 9.81 * slope; // 경사 저항력
            double fInertia = Mass * a; // 관성 저항력
            double fTotal = fRoll + fAreo + fslope + fInertia; // 총 저항력

            double wheelTorque = fTotal * WheelRadius; // 바퀴 토크
            if(wheelTorque < 0)
            {
                wheelTorque = Math.Max(wheelTorque, RegenTorqueLimit);
            }

            double motorTorque = wheelTorque / (GearRatio * DrivetrainEfficiency); // 모터 토크
            motorTorque = Math.Clamp(motorTorque, RegenTorqueLimit, MaxMotorTorque); // 모터 토크 제한

            double wheelRpm = v / (2 * Math.PI * WheelRadius) * 60; // 바퀴 RPM
            double motorPower = (motorTorque * wheelRpm * Math.PI / 30); // 모터 전력

            lastspeed = v; // 마지막 속도 업데이트
            return vbat > 0 ? motorPower / vbat : 0; // 전류 계산
        }
    }
}