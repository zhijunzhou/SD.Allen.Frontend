using Newtonsoft.Json.Linq;
using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace ConvertingJson
{
    public partial class ConvertFrm : Form
    {
        public ConvertFrm()
        {            
            InitializeComponent();
            initTokenPath();
            initProgressBar();
        }

        private void initProgressBar()
        {
            progressBar1.Visible = false;            
            progressBar1.Minimum = 1;
            progressBar1.Value = 1;
            progressBar1.Step = 1;
        }

        private void initTokenPath()
        {
            string line = null;
            StreamReader reader = null;
            try
            {
                reader = File.OpenText("path.txt");
                while ((line = reader.ReadLine()) != null)
                {
                    String[] rc = line.Split('$');
                    pathCollection.Add(new SectionPath(rc[0], rc[1], rc[2]));
                    sectionCount++;                  
                }
                cb_sectionPath.DataSource = pathCollection;
                cb_sectionPath.DisplayMember = "fullpath";
            }
            catch (Exception)
            {
                MessageBox.Show("Configuration File not found!");
            }
            finally
            {
                if(reader != null)
                    reader.Close();
            }            
            
        }

        private void parseControl()
        {
            try
            {
                // component assignment
                SectionPath sp = (SectionPath)cb_sectionPath.SelectedItem;
                sectionPath = sp.fullpath;
                sectionTitle = tb_sectionTitle.Text;
                sectionName = tb_sectionName.Text;
                // caculate total time
                Stopwatch watch = new Stopwatch();
                watch.Start();
                // Convert json to excel            
                writeToExcel("Json\\" + fb_sourcefile.Text, "Json\\" + fb_titleSource.Text);

                watch.Stop();
                TimeSpan ts = watch.Elapsed;
                // Format and display the TimeSpan value.
                string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
                    ts.Hours, ts.Minutes, ts.Seconds,
                    ts.Milliseconds / 10);
                label6.Text = "Total time: " + elapsedTime;
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
            finally
            {
                rowCount = 0;
                if (arrayRecord != null)
                    arrayRecord.Clear();
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {            
            progressBar1.Visible = true;
            progressBar1.Value = 1;
            rowCount = 4;

            parseControl();
        }

        private void writeToExcel(string path1, string path2)
        {
            object misValue = System.Reflection.Missing.Value;            
            try
            {
                //section object
                JObject o1 = JObject.Parse(File.ReadAllText(path1));
                JToken section = o1.SelectToken(sectionPath);

                //field collection
                JObject o2 = JObject.Parse(File.ReadAllText(path2));
                JToken fieldCollection = o2.SelectToken(sectionPath);

                initWorkBook();

                processHeading();

                ///  Convert Core
                convertCore(section, fieldCollection);

                applyBackgroud();

                applyFormula();

                saveAndClose();
            }
            catch (FileNotFoundException e)
            {
                MessageBox.Show("File Not Found:" + e.Message);
            }
            catch (NullReferenceException e)
            {
                MessageBox.Show("Maybe Error Json file <-> Json Path :" + e.Message);
            }
            catch(ArgumentException e)
            {
                MessageBox.Show("Error" + e.Message);
            }
            catch(COMException e)
            {
                Console.WriteLine("Error" + e.Message);
            }
            catch (Exception e)
            {
                Console.WriteLine("Error:" + e.Message);
            }
        }

        private void applyBackgroud()
        {
            oSheet.Range["A2:F2"].Interior.Color = Color.DarkSeaGreen;
            oSheet.Range["A3:F3"].Interior.Color = Color.Yellow;
            for (int i = 4; i < rowCount; i++)
            {
                if(i % 2 != 0)
                {
                    oSheet.Range["A"+i+":F" +i].Interior.Color = Color.LightBlue;
                }
            }
        }

        private void addRow(String col1,String col2, String col3, String col4)
        {
            string[] colValues = new string[5];
            colValues[0] = tb_sectionNo.Text;
            colValues[1] = col1;
            colValues[2] = col2;
            colValues[3] = col3;
            colValues[4] = col4;
            oSheet.get_Range("A" + rowCount, "E" + rowCount).Value2 = colValues;
            rowCount++;
        }

        private void excelProcessVisible()
        {
            if (chk_isShowAlway.CheckState == CheckState.Checked)
            {
                oxl.Visible = true;
            }
            else
            {
                oxl.Visible = false;
            }
        }

        private void convertCore(JToken section, JToken fieldCollection)
        {
            excelProcessVisible();
            progressBar1.Maximum = section.Children().Count();
            for (int i = 0; i < section.Children().Count(); i++)
            {
                progressBar1.PerformStep();
                JToken child = section.Children().ElementAt(i);
                JToken field = fieldCollection.Children().ElementAt(i);
                var property = child as JProperty;
                var fieldProperty = field as JProperty;
                if (property != null)
                {
                    var type = property.Value.Type;
                    if (type == JTokenType.Array)
                    {
                        JArray array = (JArray)property.Value;                        
                        if (array.Count() <= 0)
                        {                            
                            addRow(fieldProperty.Value.ToString(), property.Name.ToString(),
                                property.Name.ToString(), property.Value.Type.ToString());
                        }
                        else
                        {
                            JArray fieldSubArray = (JArray)fieldProperty.Value;                            
                            addRow("Object Array", property.Name.ToString(),
                               property.Name.ToString(), property.Value.Type.ToString());
                            JToken obj0 = (JObject)array[0];
                            // record object array
                            arrayRecord.Add(new Record(0,rowCount - 1, obj0.Children().Count()));
                            convertCore((JToken)array[0], (JToken)fieldSubArray[0]);
                        }
                    }
                    else if (type == JTokenType.Object)
                    {
                        // reset the property
                        propertiesCount = 0;                        
                        addRow("Object", property.Name.ToString(),
                               property.Name.ToString(), property.Value.Type.ToString());
                        int count = calcPropertyCount(property.Value, 0);
                        if(count > 0)
                        {
                            //Console.WriteLine(rowCount + "(" + count + ")");
                            arrayRecord.Add(new Record(0,rowCount - 1, count));
                        }else
                        {
                            arrayRecord.Add(new Record(1, rowCount - 1, propertiesCount));
                        }   
                        convertCore(property.Value, fieldProperty.Value);
                    }
                    else if (type == JTokenType.Boolean)
                    {
                        var col1 = fieldProperty.Value.ToString();
                        var col4 = "";
                        var val = (bool)property.Value;
                        if (val) //dropdown 
                        {
                            col4 = "Single Choice";
                        }
                        else
                        {
                            col4 = "Multiple Choice";
                        }
                        addRow(col1, property.Name.ToString(),
                               property.Name.ToString(), col4);                        
                    }
                    else
                    {                        
                        addRow(fieldProperty.Value.ToString(), property.Name.ToString(),
                                property.Name.ToString(), property.Value.Type.ToString());
                    }
                }
            }
            
        }

        private int calcPropertyCount(JToken token, int count)
        {
            for (int i = 0; i < token.Children().Count();i ++)
            {
                var  property = token.Children().ElementAt(i) as JProperty;
                if(property != null)
                {
                    if(property.Value.Type == JTokenType.Object)
                    {
                        ++propertiesCount;
                        calcPropertyCount(property.Value, count + 1);
                    }
                    else if(property.Value.Type == JTokenType.Array)
                    {
                        ++propertiesCount;
                        JArray array = (JArray)property.Value;
                        calcPropertyCount(array[0], count + 1);
                    }
                    else
                    {
                        ++propertiesCount;
                        ++count;
                    }
                }                
            }
            return count;
        }

        private void initWorkBook()
        {
            oxl = new Microsoft.Office.Interop.Excel.Application();
            oxl.Visible = false;
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
            oSheet.Cells[2, 2] = "Enter the Chapter's Title here";
            oSheet.Cells[2, 3] = "sectionName";
            oSheet.Cells[2, 4] = "sectionName";

            oSheet.Cells[3, 1] = "1.1";
            oSheet.Cells[3, 2] = sectionTitle;
            oSheet.Cells[3, 3] = sectionName;
            oSheet.Cells[3, 4] = sectionName;
        }

        private void applyFormula()
        {
            // fill the section title
            oRng = oSheet.get_Range("D3", "D" + (rowCount - 1));
            oRng.Formula = "=D2 & \".\" & C3";
            //Format A1:D1 as bold, vertical alignment = center.
            oSheet.get_Range("A1", "E1").Font.Bold = true;
            oSheet.get_Range("A1", "E1").VerticalAlignment =
                Microsoft.Office.Interop.Excel.XlVAlign.xlVAlignCenter;

            //Fill the section content with formula
            oRng = oSheet.get_Range("D4", "D" + (rowCount - 1));
            oRng.Formula = "=$D$3 & \".\" & C4";

            oSheet.Columns[2].ColumnWidth = 50;
            oSheet.get_Range("B1", "B" + rowCount).Cells.WrapText = true;

            Record special;
            //Fill array with formula
            for(var i = 0;i < arrayRecord.Count;i++)
            {
                Record r = (Record)arrayRecord[i];
                fillFormula(r);
                applyIndent(r);
                // only re-Fill whose's depth equal to 1
                if (r.depth == 1) {
                    special = r;                    
                    oSheet.get_Range("B" + (special.startIndex + 1), "B" + (special.startIndex + special.step)).IndentLevel = 1;
                    for (var j = i + 1; j < arrayRecord.Count; j++)
                    {
                        Record rx = (Record)arrayRecord[j];
                        if (rx.startIndex > special.startIndex + special.step) break;
                        oSheet.get_Range("D" + rx.startIndex).Formula = "=D" + special.startIndex + " & \".\" & C" + rx.startIndex;                        
                    }                    
                }
            } 

            //AutoFit columns A:D.
            oRng = oSheet.get_Range("C1", "E1");
            oRng.EntireColumn.AutoFit();            

            oSheet.get_Range("C3", "E" + rowCount).Cells.VerticalAlignment = 
                Microsoft.Office.Interop.Excel.XlHAlign.xlHAlignCenter; ;
        }

        private void applyIndent(Record r)
        {
            if(r.depth == 0)
            {
                oSheet.get_Range("B" + (r.startIndex + 1), "B" + (r.startIndex + r.step)).IndentLevel = 2;
            }            
        }

        private void fillFormula(Record r)
        {
            oRng = oSheet.get_Range("D" + (r.startIndex + 1), "D" + (r.startIndex + r.step));
            oRng.Formula = "=$D$" + r.startIndex + " & \".\" & C" + (r.startIndex + 1);
        }

        private void saveAndClose()
        {
            oxl.Visible = true;
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

        private void comboBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            SectionPath sp = (SectionPath)cb_sectionPath.SelectedItem;
            tb_sectionName.Text = sp.sectionName;
            tb_sectionTitle.Text = sp.sectionTitle;
        }

        private void button2_Click(object sender, EventArgs e)
        {
            openFileDialog1 = new OpenFileDialog();
            openFileDialog1.InitialDirectory = "C:\\";
            openFileDialog1.Filter = "json files (*.json)|*.json";
            openFileDialog1.FilterIndex = 2;
            //openFileDialog1.RestoreDirectory = true;

            if(openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    fb_sourcefile.Text = openFileDialog1.FileName;
                }
                catch (Exception)
                {

                    throw;
                }
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            openFileDialog2 = new OpenFileDialog();
            openFileDialog2.InitialDirectory = "C:\\";
            openFileDialog2.Filter = "json files (*.json)|*.json";
            openFileDialog2.FilterIndex = 2;
            openFileDialog2.RestoreDirectory = true;

            if (openFileDialog2.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    fb_titleSource.Text = openFileDialog2.FileName;
                }
                catch (Exception)
                {

                    throw;
                }
            }
        }

        private void btn_showAdv_Click(object sender, EventArgs e)
        {
            frm_adv = new BatchParseFrm(pathCollection,"Json\\" + fb_sourcefile.Text, "Json\\" + fb_titleSource.Text);
            frm_adv.Show();
        }
    }

   

}
