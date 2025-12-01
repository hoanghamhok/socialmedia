using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

public class Post
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }
    public string ImageUrl { get; set; }
    public string Caption { get; set; }
    public List<string> Likes { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
