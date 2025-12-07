// Hubs/ChatHub.cs
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;

namespace backend.Hubs
{
    public class ChatHub : Hub
{
    private readonly IMongoCollection<Message> _messages;

    public ChatHub(MongoDbContext db)
    {
        _messages = db.Messages;
    }

    public async Task SendMessage(string senderId, string receiverId, string content)
    {
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _messages.InsertOneAsync(message);

        // Gửi realtime tới receiver
        await Clients.User(receiverId).SendAsync("ReceiveMessage", new
        {
            senderId,
            message = content,
            time = message.CreatedAt
        });

        // Gửi lại cho sender (hiển thị trong box)
        await Clients.Caller.SendAsync("ReceiveMessage", new
        {
            senderId,
            message = content,
            time = message.CreatedAt
        });
    }

    public async Task MarkAsRead(string senderId, string receiverId)
    {
        var filter = Builders<Message>.Filter.Eq(m => m.SenderId, senderId) &
                     Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId) &
                     Builders<Message>.Filter.Eq(m => m.IsRead, false);

        var update = Builders<Message>.Update.Set(m => m.IsRead, true);
        await _messages.UpdateManyAsync(filter, update);
    }
}
}