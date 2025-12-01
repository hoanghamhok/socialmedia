using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly CloudinaryService _cloudinaryService;
    public PostsController(MongoDbContext db, CloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePostWithImage([FromForm] CreatePostWithImageDto dto)
    {
        var userId = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var imageUrls = new List<string>();
        if (dto.Images != null && dto.Images.Count > 0)
        {
            foreach (var file in dto.Images)
            {
                var url = await _cloudinaryService.UploadImageAsync(file);
                if (url != null) imageUrls.Add(url);
            }
        }

        var post = new Post
        {
            AuthorId = userId,
            Caption = dto.Caption,
            Images = imageUrls
        };

        _db.Posts.InsertOne(post);
        return Ok(post);
    }

    [HttpGet("feed")]
    [Authorize]
    public IActionResult GetFeed()
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        var following = _db.Follows.Find(f => f.FollowerId == userId).ToList().Select(f => f.FollowingId).ToList();
        following.Add(userId);

        var feed = _db.Posts.Find(p => following.Contains(p.AuthorId))
                            .SortByDescending(p => p.CreatedAt)
                            .Limit(50)
                            .ToList();

        return Ok(feed);
    }
}

public class CreatePostWithImageDto
{
    public string Caption { get; set; }
    public List<IFormFile> Images { get; set; }
}
