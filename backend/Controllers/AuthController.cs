using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    public AuthController(AuthService auth) { _auth = auth; }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto dto)
    {
        try {
            var user = _auth.Register(dto.Username, dto.Password, dto.FullName);
            return Ok(new { user.Id, user.Username });
        } catch(Exception e) {
            return BadRequest(new { error = e.Message });
        }
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        try {
            var token = _auth.Login(dto.Username, dto.Password);
            return Ok(new { token });
        } catch(Exception e) {
            return BadRequest(new { error = e.Message });
        }
    }
}

public record RegisterDto(string Username, string Password, string FullName);
public record LoginDto(string Username, string Password);
