
    namespace DJDiP.Infrastructure.Persistance
    {
        using Microsoft.EntityFrameworkCore;
        using DJDiP.Domain.Models;


        public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        { }
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
        public DbSet<DJProfile> DJProfiles => Set<DJProfile>();
        public DbSet<DJTop10> DJTop10s => Set<DJTop10>();
        public DbSet<Event> Events => Set<Event>();
        public DbSet<Genre> Genres => Set<Genre>();
        public DbSet<Newsletter> Newsletters => Set<Newsletter>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<PromotionCode> PromotionCodes => Set<PromotionCode>();
        public DbSet<Song> Songs => Set<Song>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();
        public DbSet<Venue> Venues => Set<Venue>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EventDJ>()
                .HasKey(edj => new { edj.EventId, edj.DJId });

            modelBuilder.Entity<EventDJ>()
                .HasOne(edj => edj.Event)
                .WithMany(e => e.EventDJs)
                .HasForeignKey(edj => edj.EventId);

            modelBuilder.Entity<EventDJ>()
                .HasOne(edj => edj.DJ)
                .WithMany(dj => dj.EventDJs)
                .HasForeignKey(edj => edj.DJId);
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId);
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Event)
                .WithMany()
                .HasForeignKey(oi => oi.EventId);
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithOne(o => o.Payment)
                .HasForeignKey<Payment>(p => p.OrderId);
            modelBuilder.Entity<DJTop10>()
                .HasOne(djt => djt.DJ)
                .WithMany(dj => dj.DJTop10s)
                .HasForeignKey(djt => djt.DJId);

            modelBuilder.Entity<DJTop10>()
                .HasOne(djt => djt.Song)
                .WithMany(song => song.DJTop10s)
                .HasForeignKey(djt => djt.SongId);

            modelBuilder.Entity<ContactMessage>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.ContactMessages)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.UserId);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Event)
                .WithMany()
                .HasForeignKey(t => t.EventId);

            base.OnModelCreating(modelBuilder);

        }

    }
    }

