public class UpdateVenueDto : CreateVenueDto
{
    public Guid Id { get; set; }
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;


}
