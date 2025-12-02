using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly MongoDbContext _db;

    public UsersController(MongoDbContext db)
    {
        _db = db;
    }

    // GET: api/Users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (string.IsNullOrEmpty(id))
            return BadRequest("User ID is required");

        var user = await _db.Users
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound("User not found");

        // Trả về chỉ những field cần thiết (đúng chuẩn API)
        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            fullName = user.FullName,
            avatarUrl = user.AvatarUrl,
            bio = user.Bio,
            followers = user.Followers,
            following = user.Following,
            createdAt = user.CreatedAt
        });
    }
}
