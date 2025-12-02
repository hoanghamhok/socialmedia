using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;


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

    // [HttpPost("create")]
    // [Authorize]
    // public async Task<IActionResult> CreatePostWithImage([FromForm] CreatePostWithImageDto dto)
    // {
    //     // Sửa lại cách đọc userId
    //     var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value  // ← Dùng ClaimTypes.NameIdentifier
    //         ?? User.FindFirst("sub")?.Value
    //         ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        
    //     Console.WriteLine($"UserId from token: {userId}");
        
    //     if (string.IsNullOrEmpty(userId))
    //     {
    //         Console.WriteLine("RETURNING UNAUTHORIZED - No userId");
            
    //         // Debug: In ra tất cả claims
    //         Console.WriteLine("=== ALL CLAIMS ===");
    //         foreach (var claim in User.Claims)
    //         {
    //             Console.WriteLine($"{claim.Type} = {claim.Value}");
    //         }
            
    //         return Unauthorized();
    //     }
        
    //     var authHeader = Request.Headers["Authorization"].ToString();
    //     Console.WriteLine($"Auth Header: {authHeader}");
        
    //     Console.WriteLine($"User authenticated: {User.Identity?.IsAuthenticated}");
        
    //     var imageUrls = new List<string>();
    //     if (dto.Images != null)
    //     {
    //         foreach (var file in dto.Images)
    //         {
    //             var url = await _cloudinaryService.UploadImageAsync(file);
    //             if (url != null) imageUrls.Add(url);
    //         }
    //     }

    //     var post = new Post
    //     {
    //         AuthorId = userId,
    //         Caption = dto.Caption,
    //         Images = imageUrls,
    //         CreatedAt = DateTime.UtcNow
    //     };

    //     _db.Posts.InsertOne(post);
    //     return Ok(post);
    // }
    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePostWithImage([FromForm] CreatePostWithImageDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Tải ảnh
        var imageUrls = new List<string>();
        if (dto.Images != null)
        {
            foreach (var file in dto.Images)
            {
                var url = await _cloudinaryService.UploadImageAsync(file);
                if (url != null) imageUrls.Add(url);
            }
        }

        // Tạo Post
        var post = new Post
        {
            AuthorId = userId,
            Caption = dto.Caption,
            Images = imageUrls,
            CreatedAt = DateTime.UtcNow
        };

        _db.Posts.InsertOne(post);

        // 🔥 Lấy user để trả về username + avatar
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();

        var response = new PostResponseDto
        {
            Id = post.Id,
            Caption = post.Caption,
            Images = post.Images,
            CreatedAt = post.CreatedAt,
            Author = new UserInfoDto
            {
                Id = user.Id,
                Username = user.Username,
                AvatarUrl = user.AvatarUrl
            }
        };

        return Ok(response);
    }

    
    [HttpGet("test-auth")]
    [Authorize]
    public IActionResult TestAuth()
    {
        return Ok($"Authenticated as: {User.FindFirst("username")?.Value}");
    }
    // [HttpGet("feed")]
    // [Authorize]
    // public IActionResult GetFeed()
    // {
    //     var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
    //          ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    //     Console.WriteLine($"UserId: {userId}");
    //     var following = _db.Follows.Find(f => f.FollowerId == userId).ToList().Select(f => f.FollowingId).ToList();
    //     following.Add(userId);

    //     var feed = _db.Posts.Find(p => following.Contains(p.AuthorId))
    //                         .SortByDescending(p => p.CreatedAt)
    //                         .Limit(50)
    //                         .ToList();

    //     return Ok(feed);
    // }
    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetFeed()
    {
        var posts = await _db.Posts
            .Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

        var userIds = posts.Select(p => p.AuthorId).Distinct().ToList();

        var users = await _db.Users
            .Find(u => userIds.Contains(u.Id))
            .ToListAsync();

        var response = posts.Select(p => {
            var user = users.FirstOrDefault(u => u.Id == p.AuthorId);

            return new PostResponseDto
            {
                Id = p.Id,
                Caption = p.Caption,
                Images = p.Images,
                CreatedAt = p.CreatedAt,
                Author = new UserInfoDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    AvatarUrl = user.AvatarUrl
                }
            };
        });

        return Ok(response);
    }

}

public class CreatePostWithImageDto
{
    public string Caption { get; set; }
    public List<IFormFile>? Images { get; set; }
}
public class PostResponseDto
{
    public string Id { get; set; }
    public string Caption { get; set; }
    public List<string> Images { get; set; }
    public DateTime CreatedAt { get; set; }

    public UserInfoDto Author { get; set; }
}

public class UserInfoDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string AvatarUrl { get; set; }
}

