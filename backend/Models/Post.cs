using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

public class Post
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string AuthorId { get; set; }
    public string Caption { get; set; }
    public List<string> Images { get; set; } = new();
    public int LikesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
