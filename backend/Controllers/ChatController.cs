using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMongoCollection<Message> _messages;

    public MessagesController(IMongoDatabase db)
    {
        _messages = db.GetCollection<Message>("Messages");
    }

    [HttpGet("unread/{userId}")]
    public async Task<IActionResult> GetUnread(string userId)
    {
        var unread = await _messages.Find(m => m.ReceiverId == userId && !m.IsRead).ToListAsync();
        var counts = unread.GroupBy(m => m.SenderId)
                           .ToDictionary(g => g.Key, g => g.Count());
        return Ok(counts);
    }
}
