using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string Avatar { get; set; }
    public string Bio { get; set; }
    public List<string> Followers { get; set; } = new();
    public List<string> Following { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
