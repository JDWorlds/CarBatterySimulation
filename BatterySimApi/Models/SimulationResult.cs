using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BatterySimApi.Models
{
    public class SimulationResult
    {
        public double Time { get; set; }
        public double Speed { get; set; }
        public double Current { get; set; }
        public double Voltage { get; set; }
        public double SOC { get; set; }
        public double Temperature { get; set; }
    }
}