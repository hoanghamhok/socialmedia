using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string AvatarUrl { get; set; }
    public string Bio { get; set; }
    public int Followers { get; set; } = 0;
    public int Following { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
