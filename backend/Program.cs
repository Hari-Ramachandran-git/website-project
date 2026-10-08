using System.Net.Mail;
using System.Text.Json;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);
// Orders are deliberately demo-only; no payment gateway or fulfilment is invoked.
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);
var app = builder.Build();
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true };
var dataDir = Path.Combine(app.Environment.ContentRootPath, "Data");
var products = JsonSerializer.Deserialize<List<Product>>(File.ReadAllText(Path.Combine(dataDir, "products.json")), jsonOptions) ?? [];
var storage = new DemoStore(dataDir, jsonOptions);

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", store = "Om Muruga Sarees", demo = true }));
app.MapGet("/api/products", (string? category, string? occasion, string? search) => {
    var result = products.Where(p =>
        (string.IsNullOrWhiteSpace(category) || p.Category.Equals(category, StringComparison.OrdinalIgnoreCase)) &&
        (string.IsNullOrWhiteSpace(occasion) || p.Occasion.Equals(occasion, StringComparison.OrdinalIgnoreCase)) &&
        (string.IsNullOrWhiteSpace(search) || $"{p.Name} {p.Category} {p.Color}".Contains(search, StringComparison.OrdinalIgnoreCase)));
    return Results.Ok(result);
});
app.MapGet("/api/products/{id:int}", (int id) => products.Find(p => p.Id == id) is Product p ? Results.Ok(p) : Results.NotFound(new { error = "Saree not found." }));
app.MapGet("/api/collections", () => Results.Ok(products.Select(p => p.Category).Distinct()));
app.MapPost("/api/orders", async (OrderRequest request) => {
    if (request.Customer is not Customer c || string.IsNullOrWhiteSpace(c.Name) || c.Name.Trim().Length is < 2 or > 100 ||
        !ValidEmail(c.Email) || !Regex.IsMatch(c.Phone ?? "", @"^\d{10}$") ||
        string.IsNullOrWhiteSpace(c.Address) || c.Address.Trim().Length is < 5 or > 300 ||
        string.IsNullOrWhiteSpace(c.City) || c.City.Length > 100 || !Regex.IsMatch(c.PostalCode ?? "", @"^[1-9]\d{5}$"))
        return Results.BadRequest(new { error = "Please enter a valid name, email, 10-digit phone number, address, city and 6-digit PIN code." });
    if (request.Items is null || request.Items.Count is < 1 or > 20 || request.Items.Any(i => i.Quantity is < 1 or > 20) ||
        request.Items.Select(i => i.Id).Distinct().Count() != request.Items.Count)
        return Results.BadRequest(new { error = "Please provide valid, unique cart items with quantities between 1 and 20." });
    var lines = new List<OrderLine>();
    foreach (var item in request.Items) {
        var p = products.Find(p => p.Id == item.Id);
        if (p is null) return Results.BadRequest(new { error = $"Product {item.Id} is unavailable." });
        if (item.Quantity > p.Stock) return Results.BadRequest(new { error = $"Only {p.Stock} of {p.Name} are available per demo order." });
        lines.Add(new(p.Id, p.Name, p.Price, item.Quantity));
    }
    // Prices and shipping are computed exclusively from the server catalogue.
    var subtotal = lines.Sum(l => l.UnitPrice * l.Quantity);
    var shipping = subtotal >= 1999 ? 0 : 99;
    var order = new DemoOrder($"OMS-{Guid.NewGuid():N}", DateTimeOffset.UtcNow,
        c with { Name = c.Name.Trim(), Email = c.Email.Trim().ToLowerInvariant(), Address = c.Address.Trim(), City = c.City.Trim() },
        lines, subtotal, shipping, subtotal + shipping, "Cash on delivery", "Demo confirmed");
    await storage.Append("orders.json", order);
    return Results.Json(new { order.Id, order.Subtotal, order.Shipping, order.Total, order.Status, demo = true }, statusCode: 201);
});
app.MapPost("/api/newsletter", async (NewsletterRequest request) => {
    if (!ValidEmail(request.Email)) return Results.BadRequest(new { error = "Please provide a valid email address." });
    await storage.Subscribe(request.Email!.Trim().ToLowerInvariant());
    return Results.Ok(new { message = "Thank you for joining the Om Muruga Sarees mailing list.", demo = true });
});
app.Run();

static bool ValidEmail(string? email) => !string.IsNullOrWhiteSpace(email) && email.Length <= 254 && MailAddress.TryCreate(email, out var address) && address.Address == email.Trim();
record Product(int Id, string Name, string Category, string Occasion, decimal Price, decimal OriginalPrice, string Color, string Image, string ImagePosition, string Badge, string Description, string Material, string Length, string Care, int Stock);
record Customer(string Name, string Email, string Phone, string Address, string City, string PostalCode);
record CartItem(int Id, int Quantity);
record OrderRequest(Customer? Customer, List<CartItem>? Items);
record OrderLine(int Id, string Name, decimal UnitPrice, int Quantity);
record DemoOrder(string Id, DateTimeOffset CreatedAt, Customer Customer, List<OrderLine> Items, decimal Subtotal, decimal Shipping, decimal Total, string PaymentMethod, string Status);
record NewsletterRequest(string? Email);
record Subscription(string Email, DateTimeOffset CreatedAt);

// A serialized, atomic JSON store is adequate for a local demo. Use a database for deployment.
sealed class DemoStore(string directory, JsonSerializerOptions options) {
    private readonly SemaphoreSlim gate = new(1, 1);
    public async Task Append<T>(string filename, T item) {
        await gate.WaitAsync();
        try {
            var path = Path.Combine(directory, filename);
            var items = File.Exists(path) ? JsonSerializer.Deserialize<List<T>>(await File.ReadAllTextAsync(path), options) ?? [] : [];
            items.Add(item);
            await Save(path, items);
        } finally { gate.Release(); }
    }
    public async Task Subscribe(string email) {
        await gate.WaitAsync();
        try {
            var path = Path.Combine(directory, "subscriptions.json");
            var items = File.Exists(path) ? JsonSerializer.Deserialize<List<Subscription>>(await File.ReadAllTextAsync(path), options) ?? [] : [];
            if (!items.Any(s => s.Email == email)) { items.Add(new(email, DateTimeOffset.UtcNow)); await Save(path, items); }
        } finally { gate.Release(); }
    }
    private async Task Save<T>(string path, List<T> items) {
        var temporary = path + ".tmp";
        await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(items, options));
        File.Move(temporary, path, true);
    }
}
