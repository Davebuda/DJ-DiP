using Microsoft.EntityFrameworkCore;
using DJDiP.Application.Interfaces;
using DJDiP.Domain.Models;

namespace DJDiP.Infrastructure.Persistance.Repositories
{
    public class DJProfileRepository : Repository<DJProfile>, IDJProfileRepository
    {
        public DJProfileRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<DJProfile?> GetByNameAsync(string name)
        {
            return await _dbSet
                .Include(dj => dj.Genres)
                .Include(dj => dj.DJTop10s)
                .FirstOrDefaultAsync(dj => dj.Name == name);
        }

        public async Task<IEnumerable<DJProfile>> GetDJsByGenreAsync(Guid genreId)
        {
            return await _dbSet
                .Include(dj => dj.Genres)
                .Include(dj => dj.DJTop10s)
                .Where(dj => dj.Genres.Any(g => g.Id == genreId))
                .ToListAsync();
        }

        public async Task<IEnumerable<DJProfile>> GetDJsWithTop10Async()
        {
            return await _dbSet
                .Include(dj => dj.Genres)
                .Include(dj => dj.DJTop10s)
                    .ThenInclude(top10 => top10.Song)
                .Where(dj => dj.DJTop10s.Any())
                .ToListAsync();
        }

        public async Task<DJProfile?> GetDJWithEventsAsync(Guid djId)
        {
            return await _dbSet
                .Include(dj => dj.Genres)
                .Include(dj => dj.DJTop10s)
                    .ThenInclude(top10 => top10.Song)
                .Include(dj => dj.EventDJs)
                    .ThenInclude(ed => ed.Event)
                .FirstOrDefaultAsync(dj => dj.Id == djId);
        }
    }
} 