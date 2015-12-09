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

namespace ConvertingJson
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            JObject o1 = JObject.Parse(File.ReadAllText(@"C:\Users\zhouzh\Desktop\oppty.json"));

            //get ClientOverview
            JToken clientOverview = o1.SelectToken("bizSoln.clientOverview.data");
            parseJsonObject(clientOverview);
        }

        private void parseJsonObject(JToken data)
        {
            foreach (JToken child in data.Children())
            {
                var property = child as JProperty;
                if (property != null)
                {
                    Console.WriteLine(property.Value.Type);
                    var type = property.Value.Type;
                    //string
                    if (type == JTokenType.String)
                    {

                    }
                    else if (type == JTokenType.)

                        Console.WriteLine(property.Name + ":" + property.Value);
                }
            }
        }
    }
}
