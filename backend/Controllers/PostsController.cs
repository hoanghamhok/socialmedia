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

    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetFeed()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Lấy tất cả post
        var posts = await _db.Posts
            .Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

        // Lấy tất cả user của post
        var userIds = posts.Select(p => p.AuthorId).Distinct().ToList();
        var users = await _db.Users
            .Find(u => userIds.Contains(u.Id))
            .ToListAsync();

        // Map dữ liệu feed
        var response = await Task.WhenAll(posts.Select(async p =>
        {
            var user = users.FirstOrDefault(u => u.Id == p.AuthorId);

            // Count likes
            var likesCount = await _db.Likes.CountDocumentsAsync(l => l.PostId == p.Id);
            // Kiểm tra user hiện tại đã like chưa
            var isLiked = await _db.Likes.Find(l => l.PostId == p.Id && l.UserId == userId).AnyAsync();

            // Count comments
            var commentsCount = await _db.Comments.CountDocumentsAsync(c => c.PostId == p.Id);

            return new
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
                },
                LikesCount = likesCount,
                IsLiked = isLiked,
                CommentsCount = commentsCount
            };
        }));

        return Ok(response);
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
}
