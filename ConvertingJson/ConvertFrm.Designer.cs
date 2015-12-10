using System.Collections;
using System.Collections.Generic;

namespace ConvertingJson
{
    partial class ConvertFrm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button1 = new System.Windows.Forms.Button();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.progressBar1 = new System.Windows.Forms.ProgressBar();
            this.label2 = new System.Windows.Forms.Label();
            this.textBox3 = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.textBox4 = new System.Windows.Forms.TextBox();
            this.textBox5 = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.comboBox1 = new System.Windows.Forms.ComboBox();
            this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
            this.openFileDialog2 = new System.Windows.Forms.OpenFileDialog();
            this.button2 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.label6 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(192, 332);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(192, 56);
            this.button1.TabIndex = 0;
            this.button1.Text = "Parse To Excel";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(157, 62);
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(337, 20);
            this.textBox1.TabIndex = 1;
            this.textBox1.Text = "C:\\Users\\zhouzh\\Desktop\\Oppty.json";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(79, 65);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(51, 13);
            this.label1.TabIndex = 2;
            this.label1.Text = "Json File:";
            // 
            // progressBar1
            // 
            this.progressBar1.Location = new System.Drawing.Point(-7, 445);
            this.progressBar1.Name = "progressBar1";
            this.progressBar1.Size = new System.Drawing.Size(630, 23);
            this.progressBar1.TabIndex = 3;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(59, 153);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(71, 13);
            this.label2.TabIndex = 4;
            this.label2.Text = "Section Path:";
            // 
            // textBox3
            // 
            this.textBox3.Location = new System.Drawing.Point(157, 238);
            this.textBox3.Name = "textBox3";
            this.textBox3.Size = new System.Drawing.Size(274, 20);
            this.textBox3.TabIndex = 6;
            this.textBox3.Text = "Opportunity Overview";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(62, 241);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(69, 13);
            this.label3.TabIndex = 7;
            this.label3.Text = "Section Title:";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(54, 198);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(77, 13);
            this.label4.TabIndex = 8;
            this.label4.Text = "Section Name:";
            // 
            // textBox4
            // 
            this.textBox4.Location = new System.Drawing.Point(157, 195);
            this.textBox4.Name = "textBox4";
            this.textBox4.Size = new System.Drawing.Size(274, 20);
            this.textBox4.TabIndex = 9;
            this.textBox4.Text = "opptyData";
            // 
            // textBox5
            // 
            this.textBox5.Location = new System.Drawing.Point(157, 109);
            this.textBox5.Name = "textBox5";
            this.textBox5.Size = new System.Drawing.Size(337, 20);
            this.textBox5.TabIndex = 10;
            this.textBox5.Text = "C:\\Users\\zhouzh\\Desktop\\Copy.json";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(56, 109);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(74, 13);
            this.label5.TabIndex = 11;
            this.label5.Text = "Json Title File:";
            // 
            // comboBox1
            // 
            this.comboBox1.FormattingEnabled = true;
            this.comboBox1.Location = new System.Drawing.Point(157, 150);
            this.comboBox1.Name = "comboBox1";
            this.comboBox1.Size = new System.Drawing.Size(390, 21);
            this.comboBox1.TabIndex = 12;
            this.comboBox1.SelectedIndexChanged += new System.EventHandler(this.comboBox1_SelectedIndexChanged);
            // 
            // openFileDialog1
            // 
            this.openFileDialog1.FileName = "openFileDialog1";
            // 
            // openFileDialog2
            // 
            this.openFileDialog2.FileName = "openFileDialog2";
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(486, 60);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(61, 23);
            this.button2.TabIndex = 13;
            this.button2.Text = "choose..";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(486, 107);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(61, 23);
            this.button3.TabIndex = 14;
            this.button3.Text = "choose..";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Click += new System.EventHandler(this.button3_Click);
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(437, 375);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(75, 13);
            this.label6.TabIndex = 15;
            this.label6.Text = "waiting to start";
            // 
            // ConvertFrm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(620, 467);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.comboBox1);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.textBox5);
            this.Controls.Add(this.textBox4);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.textBox3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.progressBar1);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.button1);
            this.Name = "ConvertFrm";
            this.Text = "Parsing Json to Excel";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.TextBox textBox1;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ProgressBar progressBar1;

        private Microsoft.Office.Interop.Excel.Application oxl;
        private Microsoft.Office.Interop.Excel._Workbook owb;
        private Microsoft.Office.Interop.Excel._Worksheet oSheet;
        private Microsoft.Office.Interop.Excel.Range oRng;
        private string sectionPath = "";
        private string fieldTitleFilepath = "";
        private string sectionName = "mapValProps";
        private string sectionTitle = "Map Value Propersiton";
        private int rowCount = 0;
        private IList arrayRecord = new List<Record>();
        private IList pathCollection = new List<SectionPath>();

        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox textBox3;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox textBox4;
        private System.Windows.Forms.TextBox textBox5;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.ComboBox comboBox1;
        private System.Windows.Forms.OpenFileDialog openFileDialog1;
        private System.Windows.Forms.OpenFileDialog openFileDialog2;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Label label6;
    }
}

