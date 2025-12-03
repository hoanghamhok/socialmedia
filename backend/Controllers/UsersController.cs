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

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
            try
            {
                var users = await _db.Users.Find(_ => true).ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching users", error = ex.Message });
            }
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
// GET: api/Users/suggested
    [HttpGet("suggested")]
    public async Task<IActionResult> GetSuggestedUsers()
    {
        try
        {
            var allUsers = await _db.Users.Find(_ => true).ToListAsync();

            // Giả sử currentUserId từ token (ở đây tạm thời hardcode)
            string currentUserId = "692ea6df1903f4419d87660f";

            // Lọc ra user chưa follow (ví dụ chưa follow = tất cả user khác currentUser)
            var suggested = allUsers
                .Where(u => u.Id != currentUserId)
                .Take(5) // giới hạn 5 user gợi ý
                .ToList();

            return Ok(suggested);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching suggested users", error = ex.Message });
        }
    }
}
