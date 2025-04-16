// Models/DriveData.cs
using CsvHelper.Configuration;

namespace BatterySimApi.Models
{
    public class DriveData
    {
        public double Time { get; set; }
        public double Speed { get; set; } // km/h
    }

    public sealed class DriveDataMap : ClassMap<DriveData>
    {
        public DriveDataMap()
        {
            Map(m => m.Time).Name("Time (s)");
            Map(m => m.Speed).Name("Speed (km/h)");
        }
    }
}