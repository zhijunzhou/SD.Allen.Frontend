namespace ConvertingJson
{
    internal class SectionPath
    {
        public string fullpath { get; set; }

        public string sectionName { get; set; }

        public string sectionTitle { get; set; }

        public SectionPath(string fullpath, string sectionName, string sectionTitle)
        {
            this.fullpath = fullpath;
            this.sectionName = sectionName;
            this.sectionTitle = sectionTitle;
        }
    }
}