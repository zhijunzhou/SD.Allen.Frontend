namespace ConvertingJson
{
    internal class Record
    {
        public int startIndex { get; set; }
        public int step { get; set; }

        public Record(int startIndex, int step)
        {
            this.startIndex = startIndex;
            this.step = step;
        }
    }
}