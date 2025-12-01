using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        _database = client.GetDatabase(config["MongoDB:Database"]);
    }
    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    public IMongoCollection<Post> Posts => _database.GetCollection<Post>("Posts");
}
