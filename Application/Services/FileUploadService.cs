using DJDiP.Application.Interfaces;

namespace DJDiP.Application.Services;

public class FileUploadService : IFileUploadService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly string[] _allowedMediaExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov", ".avi", ".mkv" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public FileUploadService(string uploadPath, string baseUrl)
    {
        _uploadPath = uploadPath;
        _baseUrl = baseUrl;

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string? folder = null)
    {
        if (!IsValidImageFile(fileName))
        {
            throw new InvalidOperationException("Invalid file type. Only image files are allowed.");
        }

        // Generate unique filename
        var extension = GetFileExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        // Create folder path if specified
        var targetPath = _uploadPath;
        if (!string.IsNullOrWhiteSpace(folder))
        {
            targetPath = Path.Combine(_uploadPath, folder);
            if (!Directory.Exists(targetPath))
            {
                Directory.CreateDirectory(targetPath);
            }
        }

        var filePath = Path.Combine(targetPath, uniqueFileName);

        // Save file
        using (var fileStreamOut = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOut);
        }

        // Return URL
        var relativePath = folder != null
            ? $"/uploads/{folder}/{uniqueFileName}"
            : $"/uploads/{uniqueFileName}";

        return $"{_baseUrl}{relativePath}";
    }

    public async Task<string> UploadMediaAsync(Stream fileStream, string fileName, string? folder = null)
    {
        if (!IsValidMediaFile(fileName))
        {
            throw new InvalidOperationException("Invalid file type. Allowed: jpg, jpeg, png, gif, webp, mp4, webm, mov, avi, mkv.");
        }

        var extension = GetFileExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        var targetPath = _uploadPath;
        if (!string.IsNullOrWhiteSpace(folder))
        {
            targetPath = Path.Combine(_uploadPath, folder);
            if (!Directory.Exists(targetPath))
            {
                Directory.CreateDirectory(targetPath);
            }
        }

        var filePath = Path.Combine(targetPath, uniqueFileName);

        using (var fileStreamOut = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOut);
        }

        var relativePath = folder != null
            ? $"/uploads/{folder}/{uniqueFileName}"
            : $"/uploads/{uniqueFileName}";

        return $"{_baseUrl}{relativePath}";
    }

    public Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Extract file path from URL
            var uri = new Uri(imageUrl);
            var relativePath = uri.AbsolutePath.TrimStart('/');
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    public bool IsValidImageFile(string fileName)
    {
        var extension = GetFileExtension(fileName).ToLowerInvariant();
        return _allowedExtensions.Contains(extension);
    }

    public bool IsValidMediaFile(string fileName)
    {
        var extension = GetFileExtension(fileName).ToLowerInvariant();
        return _allowedMediaExtensions.Contains(extension);
    }

    public string GetFileExtension(string fileName)
    {
        return Path.GetExtension(fileName).ToLowerInvariant();
    }
}
