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
            this.btn_parseJson_excel = new System.Windows.Forms.Button();
            this.fb_sourcefile = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.progressBar1 = new System.Windows.Forms.ProgressBar();
            this.lb_sectionPath = new System.Windows.Forms.Label();
            this.tb_sectionTitle = new System.Windows.Forms.TextBox();
            this.lb_sectionTitle = new System.Windows.Forms.Label();
            this.lb_sectionName = new System.Windows.Forms.Label();
            this.tb_sectionName = new System.Windows.Forms.TextBox();
            this.fb_titleSource = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.cb_sectionPath = new System.Windows.Forms.ComboBox();
            this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
            this.openFileDialog2 = new System.Windows.Forms.OpenFileDialog();
            this.button2 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.label6 = new System.Windows.Forms.Label();
            this.lb_sectionNo = new System.Windows.Forms.Label();
            this.tb_sectionNo = new System.Windows.Forms.TextBox();
            this.chk_isShowAlway = new System.Windows.Forms.CheckBox();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.num_Start = new System.Windows.Forms.NumericUpDown();
            this.num_End = new System.Windows.Forms.NumericUpDown();
            this.isBatchParse = new System.Windows.Forms.CheckBox();
            ((System.ComponentModel.ISupportInitialize)(this.num_Start)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.num_End)).BeginInit();
            this.SuspendLayout();
            // 
            // btn_parseJson_excel
            // 
            this.btn_parseJson_excel.Location = new System.Drawing.Point(192, 341);
            this.btn_parseJson_excel.Name = "btn_parseJson_excel";
            this.btn_parseJson_excel.Size = new System.Drawing.Size(192, 56);
            this.btn_parseJson_excel.TabIndex = 0;
            this.btn_parseJson_excel.Text = "Parse To Excel";
            this.btn_parseJson_excel.UseVisualStyleBackColor = true;
            this.btn_parseJson_excel.Click += new System.EventHandler(this.button1_Click);
            // 
            // fb_sourcefile
            // 
            this.fb_sourcefile.Location = new System.Drawing.Point(157, 62);
            this.fb_sourcefile.Name = "fb_sourcefile";
            this.fb_sourcefile.Size = new System.Drawing.Size(337, 20);
            this.fb_sourcefile.TabIndex = 1;
            this.fb_sourcefile.Text = "Oppty.json";
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
            // lb_sectionPath
            // 
            this.lb_sectionPath.AutoSize = true;
            this.lb_sectionPath.Location = new System.Drawing.Point(59, 153);
            this.lb_sectionPath.Name = "lb_sectionPath";
            this.lb_sectionPath.Size = new System.Drawing.Size(71, 13);
            this.lb_sectionPath.TabIndex = 4;
            this.lb_sectionPath.Text = "Section Path:";
            // 
            // tb_sectionTitle
            // 
            this.tb_sectionTitle.Location = new System.Drawing.Point(157, 238);
            this.tb_sectionTitle.Name = "tb_sectionTitle";
            this.tb_sectionTitle.Size = new System.Drawing.Size(252, 20);
            this.tb_sectionTitle.TabIndex = 6;
            this.tb_sectionTitle.Text = "Opportunity Overview";
            // 
            // lb_sectionTitle
            // 
            this.lb_sectionTitle.AutoSize = true;
            this.lb_sectionTitle.Location = new System.Drawing.Point(62, 241);
            this.lb_sectionTitle.Name = "lb_sectionTitle";
            this.lb_sectionTitle.Size = new System.Drawing.Size(69, 13);
            this.lb_sectionTitle.TabIndex = 7;
            this.lb_sectionTitle.Text = "Section Title:";
            // 
            // lb_sectionName
            // 
            this.lb_sectionName.AutoSize = true;
            this.lb_sectionName.Location = new System.Drawing.Point(287, 197);
            this.lb_sectionName.Name = "lb_sectionName";
            this.lb_sectionName.Size = new System.Drawing.Size(77, 13);
            this.lb_sectionName.TabIndex = 8;
            this.lb_sectionName.Text = "Section Name:";
            // 
            // tb_sectionName
            // 
            this.tb_sectionName.Location = new System.Drawing.Point(390, 194);
            this.tb_sectionName.Name = "tb_sectionName";
            this.tb_sectionName.Size = new System.Drawing.Size(157, 20);
            this.tb_sectionName.TabIndex = 9;
            this.tb_sectionName.Text = "opptyData";
            // 
            // fb_titleSource
            // 
            this.fb_titleSource.Location = new System.Drawing.Point(157, 109);
            this.fb_titleSource.Name = "fb_titleSource";
            this.fb_titleSource.Size = new System.Drawing.Size(337, 20);
            this.fb_titleSource.TabIndex = 10;
            this.fb_titleSource.Text = "Copy.json";
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
            // cb_sectionPath
            // 
            this.cb_sectionPath.FormattingEnabled = true;
            this.cb_sectionPath.Location = new System.Drawing.Point(157, 150);
            this.cb_sectionPath.Name = "cb_sectionPath";
            this.cb_sectionPath.Size = new System.Drawing.Size(305, 21);
            this.cb_sectionPath.TabIndex = 12;
            this.cb_sectionPath.SelectedIndexChanged += new System.EventHandler(this.comboBox1_SelectedIndexChanged);
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
            this.label6.Location = new System.Drawing.Point(483, 429);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(75, 13);
            this.label6.TabIndex = 15;
            this.label6.Text = "waiting to start";
            // 
            // lb_sectionNo
            // 
            this.lb_sectionNo.AutoSize = true;
            this.lb_sectionNo.Location = new System.Drawing.Point(60, 197);
            this.lb_sectionNo.Name = "lb_sectionNo";
            this.lb_sectionNo.Size = new System.Drawing.Size(69, 13);
            this.lb_sectionNo.TabIndex = 16;
            this.lb_sectionNo.Text = "Section No. :";
            // 
            // tb_sectionNo
            // 
            this.tb_sectionNo.Location = new System.Drawing.Point(157, 194);
            this.tb_sectionNo.Name = "tb_sectionNo";
            this.tb_sectionNo.Size = new System.Drawing.Size(83, 20);
            this.tb_sectionNo.TabIndex = 17;
            this.tb_sectionNo.Text = "1";
            // 
            // chk_isShowAlway
            // 
            this.chk_isShowAlway.AutoSize = true;
            this.chk_isShowAlway.Checked = true;
            this.chk_isShowAlway.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chk_isShowAlway.Location = new System.Drawing.Point(412, 380);
            this.chk_isShowAlway.Name = "chk_isShowAlway";
            this.chk_isShowAlway.Size = new System.Drawing.Size(118, 17);
            this.chk_isShowAlway.TabIndex = 18;
            this.chk_isShowAlway.Text = "Show Excel Always";
            this.chk_isShowAlway.UseVisualStyleBackColor = true;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(154, 291);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(30, 13);
            this.label2.TabIndex = 20;
            this.label2.Text = "From";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(272, 292);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(16, 13);
            this.label3.TabIndex = 21;
            this.label3.Text = "to";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(79, 291);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(45, 13);
            this.label4.TabIndex = 22;
            this.label4.Text = "Path i : j";
            // 
            // num_Start
            // 
            this.num_Start.Enabled = false;
            this.num_Start.Location = new System.Drawing.Point(192, 290);
            this.num_Start.Minimum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.num_Start.Name = "num_Start";
            this.num_Start.Size = new System.Drawing.Size(48, 20);
            this.num_Start.TabIndex = 23;
            this.num_Start.Value = new decimal(new int[] {
            1,
            0,
            0,
            0});
            // 
            // num_End
            // 
            this.num_End.Enabled = false;
            this.num_End.Location = new System.Drawing.Point(297, 289);
            this.num_End.Minimum = new decimal(new int[] {
            1,
            0,
            0,
            0});
            this.num_End.Name = "num_End";
            this.num_End.Size = new System.Drawing.Size(48, 20);
            this.num_End.TabIndex = 24;
            this.num_End.Value = new decimal(new int[] {
            1,
            0,
            0,
            0});
            // 
            // isBatchParse
            // 
            this.isBatchParse.AutoSize = true;
            this.isBatchParse.Enabled = false;
            this.isBatchParse.Location = new System.Drawing.Point(468, 154);
            this.isBatchParse.Name = "isBatchParse";
            this.isBatchParse.Size = new System.Drawing.Size(78, 17);
            this.isBatchParse.TabIndex = 19;
            this.isBatchParse.Text = "Choose[i, j]";
            this.isBatchParse.UseVisualStyleBackColor = true;
            this.isBatchParse.CheckedChanged += new System.EventHandler(this.isBatchParse_CheckedChanged);
            // 
            // ConvertFrm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(620, 467);
            this.Controls.Add(this.num_End);
            this.Controls.Add(this.num_Start);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.isBatchParse);
            this.Controls.Add(this.chk_isShowAlway);
            this.Controls.Add(this.tb_sectionNo);
            this.Controls.Add(this.lb_sectionNo);
            this.Controls.Add(this.label6);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.cb_sectionPath);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.fb_titleSource);
            this.Controls.Add(this.tb_sectionName);
            this.Controls.Add(this.lb_sectionName);
            this.Controls.Add(this.lb_sectionTitle);
            this.Controls.Add(this.tb_sectionTitle);
            this.Controls.Add(this.lb_sectionPath);
            this.Controls.Add(this.progressBar1);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.fb_sourcefile);
            this.Controls.Add(this.btn_parseJson_excel);
            this.MaximizeBox = false;
            this.Name = "ConvertFrm";
            this.Text = "Parsing Json to Excel";
            ((System.ComponentModel.ISupportInitialize)(this.num_Start)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.num_End)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btn_parseJson_excel;
        private System.Windows.Forms.TextBox fb_sourcefile;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ProgressBar progressBar1;

        private Microsoft.Office.Interop.Excel.Application oxl;
        private Microsoft.Office.Interop.Excel._Workbook owb;
        private Microsoft.Office.Interop.Excel._Worksheet oSheet;
        private Microsoft.Office.Interop.Excel.Range oRng;
        private string sectionPath = "";
        private string sectionName = "mapValProps";
        private string sectionTitle = "Map Value Propersiton";
        private int rowCount = 0;
        private int sectionCount = 0;
        private int propertiesCount = 0;
        private IList arrayRecord = new List<Record>();
        private IList pathCollection = new List<SectionPath>();

        private System.Windows.Forms.Label lb_sectionPath;
        private System.Windows.Forms.TextBox tb_sectionTitle;
        private System.Windows.Forms.Label lb_sectionTitle;
        private System.Windows.Forms.Label lb_sectionName;
        private System.Windows.Forms.TextBox tb_sectionName;
        private System.Windows.Forms.TextBox fb_titleSource;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.ComboBox cb_sectionPath;
        private System.Windows.Forms.OpenFileDialog openFileDialog1;
        private System.Windows.Forms.OpenFileDialog openFileDialog2;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label lb_sectionNo;
        private System.Windows.Forms.TextBox tb_sectionNo;
        private System.Windows.Forms.CheckBox chk_isShowAlway;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.NumericUpDown num_Start;
        private System.Windows.Forms.NumericUpDown num_End;
        private System.Windows.Forms.CheckBox isBatchParse;
    }
}

