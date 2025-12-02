using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly IConfiguration _config;

    public CloudinaryService(IConfiguration config)
    {
        _config = config;
        var acc = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(acc);
        
        // Tăng timeout để tránh bị ngắt kết nối
        _cloudinary.Api.Timeout = 1000000; // 5 phút (300 giây)
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            Console.WriteLine("File is null or empty");
            return null;
        }

        try
        {
            Console.WriteLine($"Starting upload: {file.FileName}, Size: {file.Length} bytes");
            
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "socialmedia/posts",
                // Giới hạn kích thước để tránh upload quá lâu
                Transformation = new Transformation()
                    .Width(2000).Height(2000).Crop("limit").Quality("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            
            Console.WriteLine($"Upload result - Status: {result.StatusCode}");
            
            // Kiểm tra kết quả upload
            if (result.StatusCode == System.Net.HttpStatusCode.OK)
            {
                Console.WriteLine($"Upload successful: {result.SecureUrl}");
                return result.SecureUrl.AbsoluteUri;
            }
            else
            {
                Console.WriteLine($"Upload failed: {result.Error?.Message}");
                return null;
            }
        }
        catch (System.Net.Http.HttpRequestException ex)
        {
            Console.WriteLine($"Network error during upload: {ex.Message}");
            Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
            
            // Kiểm tra credentials
            Console.WriteLine($"CloudName: {_config["Cloudinary:CloudName"]}");
            Console.WriteLine($"ApiKey exists: {!string.IsNullOrEmpty(_config["Cloudinary:ApiKey"])}");
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error during upload: {ex.GetType().Name}");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return null;
        }
    }
}