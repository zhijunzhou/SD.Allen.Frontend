using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Office.Interop.Excel;

namespace ConvertingJson
{
    public partial class ConvertFrm : Form
    {

        public ConvertFrm()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            sectionPath = textBox2.Text;
            sectionTitle = textBox3.Text;
            sectionName = textBox4.Text;
            rowCount = 3;
            writeToExcel("");
        }
        
        private void writeToExcel(string path)
        {            
            object misValue = System.Reflection.Missing.Value;

            JObject o1 = JObject.Parse(File.ReadAllText(@"C:\Users\zhouzh\Desktop\oppty.json"));
            //get 
            JToken section = o1.SelectToken(sectionPath);           
            try
            {
                initWorkBook();

                processHeading();
                ///
                ///  Convert Core
                /// 
                convertCore(section);

                applyFormula();

                saveAndClose();
            }
            catch (Exception)
            {
                Console.WriteLine("Error");
            }
        }

        private void convertCore(JToken section)
        {
            foreach (JToken child in section.Children())
            {
                string[] colValues = new string[5];
                var property = child as JProperty;
                if (property != null)
                {
                    var type = property.Value.Type;
                    if (type == JTokenType.Array)
                    {

                    }
                    else if (type == JTokenType.Object)
                    {

                    }
                    else
                    {
                        colValues[0] = "1.1";
                        colValues[1] = property.Value.ToString();
                        colValues[2] = property.Name.ToString();
                        colValues[3] = property.Name.ToString();
                        colValues[4] = property.Value.Type.ToString();
                        oSheet.get_Range("A" + rowCount, "E" + rowCount).Value2 = colValues;
                        rowCount++;
                    }

                }

            }
        }

        private void initWorkBook()
        {
            oxl = new Microsoft.Office.Interop.Excel.Application();
            oxl.Visible = true;
            owb = oxl.Workbooks.Add("");
            oSheet = owb.ActiveSheet;
        }

        private void processHeading()
        {
            //Add table headers going cell by cell.
            oSheet.Cells[1, 1] = "Section";
            oSheet.Cells[1, 2] = "Display Name";
            oSheet.Cells[1, 3] = "Internal Name";
            oSheet.Cells[1, 4] = "Full Name";
            oSheet.Cells[1, 5] = "Field Type";

            oSheet.Cells[2, 1] = "1";
            oSheet.Cells[2, 2] = sectionTitle;
            oSheet.Cells[2, 3] = sectionName;
        }

        private void applyFormula()
        {
            //Format A1:D1 as bold, vertical alignment = center.
            oSheet.get_Range("A1", "E1").Font.Bold = true;
            oSheet.get_Range("A1", "E1").VerticalAlignment =
                Microsoft.Office.Interop.Excel.XlVAlign.xlVAlignCenter;

            //Fill cell with formula
            oRng = oSheet.get_Range("D3", "D" + (rowCount - 1));
            oRng.Formula = "=$C$2 & \".\" & C3";

            ////Fill D2:D6 with a formula(=RAND()*100000) and apply format.
            //oRng = oSheet.get_Range("D2", "D6");
            //oRng.Formula = "=RAND()*100000";
            //oRng.NumberFormat = "$0.00";

            //AutoFit columns A:D.
            oRng = oSheet.get_Range("A1", "D1");
            oRng.EntireColumn.AutoFit();
        }

        private void saveAndClose()
        {
            //oxl.Visible = false;
            oxl.UserControl = false;
            owb.SaveAs("c:\\test\\test505.xls", Microsoft.Office.Interop.Excel.XlFileFormat.xlWorkbookDefault, Type.Missing, Type.Missing,
        false, false, Microsoft.Office.Interop.Excel.XlSaveAsAccessMode.xlNoChange,
        Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing);

            owb.Close();
        }

        private void parseJsonObject(JToken data)
        {
            foreach (JToken child in data.Children())
            {
                var property = child as JProperty;
                if (property != null)
                {
                    var type = property.Value.Type;
                    if (type == JTokenType.Array)
                    {
                        Console.WriteLine(property.Name + ": [");
                        foreach (JToken grandChild in property.Value)
                        {
                            parseJsonObject(grandChild);
                        }
                        Console.WriteLine(property.Name + "]");
                    }
                    else if (type == JTokenType.Object)
                    {
                        Console.WriteLine(property.Name + ": {");
                        parseJsonObject(property.Value);
                        Console.WriteLine(property.Name + "}");
                    }
                    else
                    {
                        Console.WriteLine(property.Name + ":" + property.Value);
                    }

                }
            }
        }
    }

}
