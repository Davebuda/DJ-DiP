using DJDiP.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
#pragma warning disable CS0436 // Type conflicts with imported type
builder.Services.AddDbContext<AppDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
#pragma warning restore CS0436 // Type conflicts with imported type
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
