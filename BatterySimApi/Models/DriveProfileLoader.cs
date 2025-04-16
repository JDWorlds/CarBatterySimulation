using System.Collections.Generic;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;

namespace BatterySimApi.Models
{
    public class DriveProfileLoader
    {
        public static List<DriveData> LoadFromCsv(string filePath)
        {
            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                csv.Context.RegisterClassMap<DriveDataMap>();
                return csv.GetRecords<DriveData>().ToList();
            }
        }
    }

}