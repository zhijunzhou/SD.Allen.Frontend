namespace ConvertingJson
{
    internal class Record
    {
        public int depth { get; set; }
        public int startIndex { get; set; }
        public int step { get; set; }
        

        public Record(int depth,int startIndex, int step)
        {
            this.depth = depth;
            this.startIndex = startIndex;
            this.step = step;
        }
        
    }
}