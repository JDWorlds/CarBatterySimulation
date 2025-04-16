// Controllers/SimulationController.cs
using Microsoft.AspNetCore.Mvc;
using BatterySimApi.Models;
using CsvHelper;
using System.Globalization;


namespace BatterySimApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            string driveProfilePath = "sample_drive_profile.csv";
            string ocvPath = "ocv_table.csv";
            string resistancePath = "resistance_map.csv";

            //시간 세팅
            double dt = 1.0;

            if (!System.IO.File.Exists(driveProfilePath)||!System.IO.File.Exists(ocvPath)||!System.IO.File.Exists(resistancePath))
                return NotFound("Drive profile CSV not found.");

            var driveProfile = DriveProfileLoader.LoadFromCsv(driveProfilePath);

            var ocvTable = new OCVTable();
            ocvTable.LoadFromCsv(ocvPath);

            var resistanceMap = new InternalResistanceMap();
            resistanceMap.LoadFromCsv(resistancePath);

            var battery = new BatteryModel(ocvTable, resistanceMap);


            // 차량 모델 초기화
            var vehicle = new VehicleModel();

            var resultList = new List<SimulationResult>();

            foreach (var data in driveProfile)
            {
                double current = vehicle.ComputeRequiredCurrent(data.Speed, dt, battery.Voltage);
                battery.Step(current, dt);


                resultList.Add(new SimulationResult
                {
                    Time = data.Time,
                    Speed = data.Speed,
                    Current = Math.Round(current, 2),
                    Voltage = Math.Round(battery.Voltage, 2),
                    SOC = Math.Round(battery.Soc * 100, 1),
                    Temperature = Math.Round(battery.TemperatureC, 1)
                });
            }

            return Ok(resultList);
        }
    }
}