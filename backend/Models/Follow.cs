using System;

public class Follow
{
    public string Id { get; set; }
    public string FollowerId { get; set; }
    public string FollowingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
