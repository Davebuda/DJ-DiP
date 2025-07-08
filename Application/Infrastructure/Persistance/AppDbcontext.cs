
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
        public DbSet<Event> Event => Set<Event>();
        public DbSet<Genre> Genres => Set<Genre>();
        public DbSet<Newsletter> Newsletter => Set<Newsletter>();
        public DbSet<Notification> Notification => Set<Notification>();
        public DbSet<Order> Order => Set<Order>();
        public DbSet<OrderItem> OrderItem => Set<OrderItem>();
        public DbSet<Payment> Payment => Set<Payment>();
        public DbSet<PromotionCode> PromotionCode => Set<PromotionCode>();
        public DbSet<Song> Song => Set<Song>();
        public DbSet<Ticket> Ticket => Set<Ticket>();
        public DbSet<ApplicationUser> ApplicationUser => Set<ApplicationUser>();
        public DbSet<Venue> Venue => Set<Venue>();


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
                .WithMany(u => u.Order)
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
                .WithMany(u => u.ContactMessage)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notification)
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

