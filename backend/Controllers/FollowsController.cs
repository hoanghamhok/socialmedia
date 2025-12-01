using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class FollowsController : ControllerBase
{
    private readonly MongoDbContext _db;
    public FollowsController(MongoDbContext db) { _db = db; }

    [HttpPost("{followingId}")]
    [Authorize]
    public IActionResult Follow(string followingId)
    {
        var followerId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(followerId)) return Unauthorized();
        if (followerId == followingId) return BadRequest(new { error = "Cannot follow yourself" });

        var existing = _db.Follows.Find(f => f.FollowerId == followerId && f.FollowingId == followingId).FirstOrDefault();
        if (existing != null) return BadRequest(new { error = "Already following" });

        var follow = new Follow { FollowerId = followerId, FollowingId = followingId };
        _db.Follows.InsertOne(follow);

        _db.Users.UpdateOne(u => u.Id == followerId, Builders<User>.Update.Inc(u => u.Following, 1));
        _db.Users.UpdateOne(u => u.Id == followingId, Builders<User>.Update.Inc(u => u.Followers, 1));

        return Ok(follow);
    }

    [HttpDelete("{followingId}")]
    [Authorize]
    public IActionResult Unfollow(string followingId)
    {
        var followerId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(followerId)) return Unauthorized();

        var result = _db.Follows.DeleteOne(f => f.FollowerId == followerId && f.FollowingId == followingId);
        if (result.DeletedCount == 0) return BadRequest(new { error = "Not following" });

        _db.Users.UpdateOne(u => u.Id == followerId, Builders<User>.Update.Inc(u => u.Following, -1));
        _db.Users.UpdateOne(u => u.Id == followingId, Builders<User>.Update.Inc(u => u.Followers, -1));

        return Ok(new { message = "Unfollowed" });
    }
}
