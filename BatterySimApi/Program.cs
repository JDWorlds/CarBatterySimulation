var builder = WebApplication.CreateBuilder(args);

// CORS policy to allow requests from the specified origin
builder.Services.AddCors(options => 

{
    options.AddPolicy("AllowLocalhostFronted", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Replace with your frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Allow credentials if needed
    });
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowLocalhostFronted"); // Use the CORS policy

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowLocalhostFronted"); // Use the CORS policy
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
