using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly MongoDbContext _db;
    public CommentsController(MongoDbContext db) { _db = db; }

    [HttpPost]
    [Authorize]
    public IActionResult CreateComment([FromBody] CreateCommentDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value  // ← Dùng ClaimTypes.NameIdentifier
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        
        Console.WriteLine($"UserId from token: {userId}");
        
        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("RETURNING UNAUTHORIZED - No userId");
            
            // Debug: In ra tất cả claims
            Console.WriteLine("=== ALL CLAIMS ===");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"{claim.Type} = {claim.Value}");
            }
            
            return Unauthorized();
        }
        
        var authHeader = Request.Headers["Authorization"].ToString();
        Console.WriteLine($"Auth Header: {authHeader}");
        
        Console.WriteLine($"User authenticated: {User.Identity?.IsAuthenticated}");
        
        var post = _db.Posts.Find(p => p.Id == dto.PostId).FirstOrDefault();
        if (post == null) return NotFound(new { error = "Post not found" });

        var comment = new Comment
        {
            PostId = dto.PostId,
            UserId = userId,
            Content = dto.Content
        };

        _db.Comments.InsertOne(comment);

        // Update comments count
        var update = Builders<Post>.Update.Inc(p => p.CommentsCount, 1);
        _db.Posts.UpdateOne(p => p.Id == dto.PostId, update);

        return Ok(comment);
    }

    [HttpGet("{postId}")]
    public IActionResult GetComments(string postId)
    {
        var comments = _db.Comments.Find(c => c.PostId == postId)
                                   .SortBy(c => c.CreatedAt)
                                   .ToList();
        return Ok(comments);
    }
}

public record CreateCommentDto(string PostId, string Content);
