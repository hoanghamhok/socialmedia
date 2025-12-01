using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly MongoDbContext _db;
    public PostsController(MongoDbContext db) { _db = db; }

    [HttpPost]
    [Authorize]
    public IActionResult CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        // Alternatively parse "sub" claim
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = _db.Users.Find(u => u.Id == userId).FirstOrDefault();
        if (user == null) return Unauthorized();

        var post = new Post {
            UserId = userId,
            Username = user.Username,
            ImageUrl = dto.ImageUrl,
            Caption = dto.Caption
        };
        _db.Posts.InsertOne(post);
        return Ok(post);
    }

    [HttpGet("feed")]
    [Authorize]
    public IActionResult GetFeed()
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var me = _db.Users.Find(u => u.Id == userId).FirstOrDefault();
        var following = me?.Following ?? new System.Collections.Generic.List<string>();
        // include own posts as well
        following.Add(userId);
        var feed = _db.Posts.Find(p => following.Contains(p.UserId))
                            .SortByDescending(p => p.CreatedAt)
                            .Limit(50)
                            .ToList();
        return Ok(feed);
    }

    [HttpPost("{id}/like")]
    [Authorize]
    public IActionResult ToggleLike(string id)
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var post = _db.Posts.Find(p => p.Id == id).FirstOrDefault();
        if (post == null) return NotFound();
        if (post.Likes.Contains(userId)) {
            post.Likes.Remove(userId);
        } else {
            post.Likes.Add(userId);
        }
        _db.Posts.ReplaceOne(p => p.Id == id, post);
        return Ok(post);
    }

    [HttpPost("{id}/comment")]
    [Authorize]
    public IActionResult AddComment(string id, [FromBody] CommentDto dto)
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var user = _db.Users.Find(u => u.Id == userId).FirstOrDefault();
        var post = _db.Posts.Find(p => p.Id == id).FirstOrDefault();
        if (post == null) return NotFound();

        var comment = new Comment { UserId = userId, Username = user.Username, Text = dto.Text };
        post.Comments.Add(comment);
        _db.Posts.ReplaceOne(p => p.Id == id, post);
        return Ok(post);
    }
}

public record CreatePostDto(string ImageUrl, string Caption);
public record CommentDto(string Text);
