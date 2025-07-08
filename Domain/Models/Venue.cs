namespace DJDiP.Domain.Models

{
    public class Venue
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }


        public required string Location { get; set; }
        public required string MapLink   { get; set; }
    }
    
}