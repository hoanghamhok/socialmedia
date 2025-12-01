using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class LikesController : ControllerBase
{
    private readonly MongoDbContext _db;
    public LikesController(MongoDbContext db) { _db = db; }

    [HttpPost("{postId}")]
    [Authorize]
    public IActionResult LikePost(string postId)
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var existing = _db.Likes.Find(l => l.PostId == postId && l.UserId == userId).FirstOrDefault();
        if (existing != null) return BadRequest(new { error = "Already liked" });

        var like = new Like { PostId = postId, UserId = userId };
        _db.Likes.InsertOne(like);

        var update = Builders<Post>.Update.Inc(p => p.LikesCount, 1);
        _db.Posts.UpdateOne(p => p.Id == postId, update);

        return Ok(like);
    }

    [HttpDelete("{postId}")]
    [Authorize]
    public IActionResult UnlikePost(string postId)
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = _db.Likes.DeleteOne(l => l.PostId == postId && l.UserId == userId);
        if (result.DeletedCount == 0) return BadRequest(new { error = "Not liked yet" });

        var update = Builders<Post>.Update.Inc(p => p.LikesCount, -1);
        _db.Posts.UpdateOne(p => p.Id == postId, update);

        return Ok(new { message = "Unliked" });
    }
}
