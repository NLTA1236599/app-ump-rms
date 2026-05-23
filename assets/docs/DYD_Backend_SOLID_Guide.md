# DYD Backend — SOLID Refactoring Guide

> **Stack:** ASP.NET Core 10 · Clean Architecture · EF Core · ASP.NET Identity · Port 5443  
> **Companion service:** DYD.AiService (Python FastAPI, port 4402) → Ollama + Qdrant  
> **Consumers:** fe0/User (React+Vite, 8080) and fe-admin (React+Vite, 8082) — both via JWT

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [SOLID Principles — Applied](#3-solid-principles--applied)
   - [S — Single Responsibility](#s--single-responsibility-principle)
   - [O — Open/Closed](#o--openclosed-principle)
   - [L — Liskov Substitution](#l--liskov-substitution-principle)
   - [I — Interface Segregation](#i--interface-segregation-principle)
   - [D — Dependency Inversion](#d--dependency-inversion-principle)
4. [Step-by-Step Refactoring Plan](#4-step-by-step-refactoring-plan)
5. [JWT Auth for Two Frontends](#5-jwt-auth-for-two-frontends)
6. [AI Service Integration](#6-ai-service-integration)
7. [EF Core + Identity Setup](#7-ef-core--identity-setup)
8. [Code Samples](#8-code-samples)
9. [Checklist](#9-checklist)

---

## 1. Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐
│  fe0  (User)     │     │  fe-admin        │
│  React + Vite    │     │  React + Vite    │
│  :8080           │     │  :8082           │
└────────┬─────────┘     └────────┬─────────┘
         │  JWT Bearer             │  JWT Bearer
         └────────────┬────────────┘
                      ▼
         ┌────────────────────────┐
         │      DYD.Api  :5443    │  ← Backend chính
         │  ASP.NET Core 10       │
         │  Clean Architecture    │
         │  EF Core + Identity    │
         └────────┬───────────────┘
                  │ SQL              │ HTTP
                  ▼                  ▼
           ┌──────────┐    ┌─────────────────────┐
           │ LocalDB  │    │  DYD.AiService :4402 │
           │ DYD_Dev  │    │  Python FastAPI       │
           └──────────┘    │  → Ollama, Qdrant     │
                           └─────────────────────┘
```

**Data flow rules:**
- Frontends only talk to `DYD.Api` — never directly to `DYD.AiService`.
- `DYD.Api` calls `DYD.AiService` over plain HTTP (internal network).
- Authentication is JWT-only; cookies are not used.

---

## 2. Project Structure

```
DYD/
├── DYD.Api/                        # Entry point — ASP.NET Core Web API
│   ├── Controllers/
│   ├── Middleware/
│   ├── Extensions/                 # IServiceCollection extension methods
│   └── Program.cs
│
├── DYD.Application/                # Use-cases, DTOs, interfaces
│   ├── Common/
│   │   ├── Interfaces/             # IRepository<T>, ICurrentUser, IAiClient …
│   │   ├── Behaviours/             # MediatR pipeline (logging, validation)
│   │   └── Exceptions/
│   ├── Features/
│   │   ├── Auth/
│   │   ├── Products/               # example domain feature
│   │   └── AiChat/
│   └── DYD.Application.csproj
│
├── DYD.Domain/                     # Pure domain — no framework references
│   ├── Entities/
│   ├── Enums/
│   ├── Events/
│   └── DYD.Domain.csproj
│
├── DYD.Infrastructure/             # EF Core, Identity, HTTP clients
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/         # IEntityTypeConfiguration<T>
│   │   └── Repositories/
│   ├── Identity/
│   ├── Services/                   # AiServiceClient, TokenService …
│   └── DYD.Infrastructure.csproj
│
└── DYD.AiService/                  # Python FastAPI (separate repo/process)
    ├── main.py
    ├── routers/
    └── services/
```

**Dependency rule (Clean Architecture):**
```
Domain  ←  Application  ←  Infrastructure
                         ←  Api
```
`Domain` and `Application` have **zero** framework dependencies.

---

## 3. SOLID Principles — Applied

### S — Single Responsibility Principle

> *A class should have only one reason to change.*

**Problem:** Fat controllers that validate input, run business logic, talk to the database, and send emails.

**Fix:** One controller action → one MediatR command/query → one handler.

```
AuthController.Register()
    └─► SendAsync(new RegisterUserCommand(dto))
            └─► RegisterUserCommandHandler   (one responsibility: register a user)
                    ├─► IUserRepository      (persistence)
                    ├─► IPasswordHasher      (hashing)
                    └─► ITokenService        (JWT minting)
```

Each class is responsible for exactly one concern. Changing the hashing algorithm does not touch the controller or the repository.

---

### O — Open/Closed Principle

> *Open for extension, closed for modification.*

**Problem:** Adding a new AI provider requires editing existing switch/if chains.

**Fix:** Use a strategy pattern with a registry.

```csharp
// Application layer — stable interface
public interface IAiProvider
{
    string Name { get; }
    Task<string> CompleteAsync(string prompt, CancellationToken ct);
}

// Infrastructure layer — new providers added without touching existing code
public class OllamaProvider : IAiProvider { … }
public class OpenAiProvider : IAiProvider { … }

// Registration — add providers via DI, never modify the dispatcher
services.AddKeyedScoped<IAiProvider, OllamaProvider>("ollama");
services.AddKeyedScoped<IAiProvider, OpenAiProvider>("openai");
```

---

### L — Liskov Substitution Principle

> *Subtypes must be substitutable for their base types without breaking the program.*

**Problem:** A `ReadOnlyRepository` inherits `IRepository<T>` but throws `NotSupportedException` on `Add()`.

**Fix:** Split the interface so read-only consumers never receive a writable contract.

```csharp
public interface IReadRepository<T>  { Task<T?> GetByIdAsync(Guid id); }
public interface IRepository<T> : IReadRepository<T>
{
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}
```

Consumers that only read declare `IReadRepository<T>` — they can safely receive any implementation.

---

### I — Interface Segregation Principle

> *Clients should not depend on methods they do not use.*

**Problem:** One giant `IUserService` with `Register`, `Login`, `UpdateProfile`, `DeleteAccount`, `SendPasswordReset`, `GetAdminStats` …

**Fix:** Break into focused interfaces.

```csharp
public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest req);
    Task<AuthResult> LoginAsync(LoginRequest req);
    Task LogoutAsync(Guid userId);
}

public interface IUserProfileService
{
    Task<UserProfile> GetAsync(Guid userId);
    Task UpdateAsync(Guid userId, UpdateProfileRequest req);
}

public interface IAdminUserService
{
    Task<PagedList<UserSummary>> ListAsync(UserFilter filter);
    Task DeleteAsync(Guid userId);
}
```

`fe0` injects `IAuthService` + `IUserProfileService`.  
`fe-admin` injects `IAdminUserService`.  
Neither sees methods it doesn't need.

---

### D — Dependency Inversion Principle

> *Depend on abstractions, not concretions.*

**Problem:** `ProductHandler` newing up `new SqlProductRepository()` or `new HttpClient()` directly.

**Fix:** Inject abstractions; bind concretions in `Infrastructure`.

```csharp
// Application — defines the contract
public interface IProductRepository : IRepository<Product> { }

// Handler — depends only on the abstraction
public class GetProductQueryHandler(IProductRepository repo)
    : IRequestHandler<GetProductQuery, ProductDto>
{
    public async Task<ProductDto> Handle(GetProductQuery q, CancellationToken ct)
        => (await repo.GetByIdAsync(q.Id)).ToDto();
}

// Infrastructure — wires concretion
services.AddScoped<IProductRepository, EfProductRepository>();
```

The handler never imports `Microsoft.EntityFrameworkCore`.

---

## 4. Step-by-Step Refactoring Plan

### Step 0 — Prerequisites

```bash
dotnet new sln -n DYD
dotnet new webapi     -n DYD.Api            -o src/DYD.Api
dotnet new classlib   -n DYD.Application    -o src/DYD.Application
dotnet new classlib   -n DYD.Domain         -o src/DYD.Domain
dotnet new classlib   -n DYD.Infrastructure -o src/DYD.Infrastructure

dotnet sln add src/**/*.csproj
```

Project references (enforce the dependency rule):

```bash
dotnet add src/DYD.Application    reference src/DYD.Domain
dotnet add src/DYD.Infrastructure reference src/DYD.Application
dotnet add src/DYD.Api            reference src/DYD.Application
dotnet add src/DYD.Api            reference src/DYD.Infrastructure
```

### Step 1 — Build the Domain

Create pure entity classes with no framework imports.

```csharp
// DYD.Domain/Entities/User.cs
public sealed class User
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public UserRole Role { get; private set; }

    private User() { }   // EF

    public static User Create(string email, string hash, UserRole role)
        => new() { Email = email, PasswordHash = hash, Role = role };
}
```

### Step 2 — Define Application Interfaces

Every external concern gets an interface in `DYD.Application.Common.Interfaces`.

```
IRepository<T>
IUserRepository        : IRepository<User>
ITokenService          — mint / validate JWT
ICurrentUserService    — read claims from HttpContext
IAiServiceClient       — HTTP calls to DYD.AiService
IDateTimeProvider      — testable DateTime.UtcNow
```

### Step 3 — Write Use-Cases with MediatR

Install: `dotnet add src/DYD.Application package MediatR`

```csharp
// Command
public record LoginCommand(string Email, string Password) : IRequest<AuthTokenDto>;

// Handler
public class LoginCommandHandler(
    IUserRepository users,
    IPasswordHasher<User> hasher,
    ITokenService tokens)
    : IRequestHandler<LoginCommand, AuthTokenDto>
{
    public async Task<AuthTokenDto> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var user = await users.GetByEmailAsync(cmd.Email, ct)
            ?? throw new UnauthorizedException();

        if (hasher.VerifyHashedPassword(user, user.PasswordHash, cmd.Password)
                == PasswordVerificationResult.Failed)
            throw new UnauthorizedException();

        return tokens.Generate(user);
    }
}
```

### Step 4 — Implement Infrastructure

```csharp
// DYD.Infrastructure/Persistence/AppDbContext.cs
public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### Step 5 — Slim Down Controllers

Controllers become thin HTTP adapters — they only translate HTTP ↔ MediatR.

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest req, CancellationToken ct)
    {
        var token = await sender.Send(new LoginCommand(req.Email, req.Password), ct);
        return Ok(token);
    }
}
```

No business logic. No `new`. No direct DB access.

### Step 6 — Register Everything in Program.cs

Keep `Program.cs` declarative by using extension methods.

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplicationServices()       // MediatR, validators, behaviours
    .AddInfrastructureServices(builder.Configuration)  // EF, Identity, HttpClients
    .AddApiServices();              // Controllers, Swagger, CORS

var app = builder.Build();
app.UseApiMiddleware();
app.Run();
```

---

## 5. JWT Auth for Two Frontends

Both frontends share the same JWT configuration. Role claims differentiate them.

```csharp
// Infrastructure/Extensions/AuthExtensions.cs
public static IServiceCollection AddJwtAuth(
    this IServiceCollection services, IConfiguration config)
{
    services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidIssuer              = config["Jwt:Issuer"],
                ValidateAudience         = true,
                ValidAudiences           = config.GetSection("Jwt:Audiences").Get<string[]>(),
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = new SymmetricSecurityKey(
                                               Encoding.UTF8.GetBytes(config["Jwt:Key"]!)),
                ValidateLifetime         = true,
            };
        });

    services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
        options.AddPolicy("UserOnly",  p => p.RequireRole("User", "Admin"));
    });

    return services;
}
```

```json
// appsettings.Development.json
{
  "Jwt": {
    "Issuer":    "DYD.Api",
    "Audiences": ["fe0-user", "fe-admin"],
    "Key":       "your-256-bit-secret-stored-in-user-secrets"
  }
}
```

Token generation uses `ITokenService` so the concrete implementation (`JwtTokenService`) lives only in Infrastructure.

---

## 6. AI Service Integration

`DYD.AiService` is treated as an external dependency — accessed through an interface.

```csharp
// Application — interface
public interface IAiServiceClient
{
    Task<string> ChatAsync(string prompt, CancellationToken ct);
    Task<float[]> EmbedAsync(string text, CancellationToken ct);
}

// Infrastructure — implementation
public class AiServiceClient(HttpClient http) : IAiServiceClient
{
    public async Task<string> ChatAsync(string prompt, CancellationToken ct)
    {
        var res = await http.PostAsJsonAsync("/chat", new { prompt }, ct);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<ChatResponse>(ct);
        return body!.Answer;
    }

    public async Task<float[]> EmbedAsync(string text, CancellationToken ct)
    {
        var res = await http.PostAsJsonAsync("/embed", new { text }, ct);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<EmbedResponse>(ct);
        return body!.Vector;
    }
}

// Registration with typed HttpClient + resilience
services.AddHttpClient<IAiServiceClient, AiServiceClient>(c =>
    c.BaseAddress = new Uri(config["AiService:BaseUrl"]!))
    .AddStandardResilienceHandler();   // Polly: retry + circuit breaker
```

If `DYD.AiService` is down, only the `IAiServiceClient` implementation throws — application handlers catch a domain exception, not an `HttpRequestException`.

---

## 7. EF Core + Identity Setup

```csharp
// ApplicationUser extends IdentityUser but lives in Infrastructure
public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}

// DbContext registration
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(config.GetConnectionString("DYD_Dev")));

services.AddIdentityCore<ApplicationUser>()
    .AddRoles<ApplicationRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
```

Keep EF configurations separate from the entity classes:

```csharp
// Infrastructure/Persistence/Configurations/ProductConfiguration.cs
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.HasKey(p => p.Id);
        b.Property(p => p.Name).HasMaxLength(200).IsRequired();
        b.HasIndex(p => p.Name);
    }
}
```

---

## 8. Code Samples

### MediatR Pipeline Behaviour (Logging + Validation)

```csharp
// Application/Common/Behaviours/LoggingBehaviour.cs
public class LoggingBehaviour<TRequest, TResponse>(ILogger<TRequest> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        logger.LogInformation("Handling {Name}", typeof(TRequest).Name);
        var response = await next();
        logger.LogInformation("Handled  {Name}", typeof(TRequest).Name);
        return response;
    }
}

// Application/Common/Behaviours/ValidationBehaviour.cs
public class ValidationBehaviour<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

### Global Exception Handler

```csharp
// Api/Middleware/ExceptionHandlerMiddleware.cs
public class ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            ctx.Response.ContentType = "application/json";

            (ctx.Response.StatusCode, var title) = ex switch
            {
                ValidationException   => (400, "Validation Error"),
                NotFoundException     => (404, "Not Found"),
                UnauthorizedException => (401, "Unauthorized"),
                _                     => (500, "Server Error"),
            };

            await ctx.Response.WriteAsJsonAsync(new { title, detail = ex.Message });
        }
    }
}
```

### Repository Base

```csharp
// Infrastructure/Persistence/Repositories/RepositoryBase.cs
public abstract class RepositoryBase<T>(AppDbContext db) : IRepository<T>
    where T : class
{
    protected readonly DbSet<T> Set = db.Set<T>();

    public Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => Set.FindAsync([id], ct).AsTask();

    public async Task AddAsync(T entity, CancellationToken ct = default)
    {
        await Set.AddAsync(entity, ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        Set.Update(entity);
        await db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await GetByIdAsync(id, ct) ?? throw new NotFoundException();
        Set.Remove(entity);
        await db.SaveChangesAsync(ct);
    }
}
```

### Application DI Extension

```csharp
// Application/Extensions/ServiceCollectionExtensions.cs
public static IServiceCollection AddApplicationServices(this IServiceCollection services)
{
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly);
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
    });

    services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

    return services;
}
```

---

## 9. Checklist

Use this list to track refactoring progress.

### Project Setup
- [ ] Four projects created: `Domain`, `Application`, `Infrastructure`, `Api`
- [ ] Project references follow Clean Architecture direction
- [ ] `Domain` has no NuGet dependencies

### Domain
- [ ] Entities use private setters + factory methods
- [ ] No `using Microsoft.*` in `Domain`

### Application
- [ ] Every external concern has an interface in `Common/Interfaces/`
- [ ] Commands and queries use MediatR `IRequest<T>`
- [ ] Logging and Validation behaviours registered
- [ ] FluentValidation validators for every command

### Infrastructure
- [ ] `AppDbContext` uses `IEntityTypeConfiguration<T>` per entity
- [ ] Repositories extend `RepositoryBase<T>`
- [ ] `AiServiceClient` uses `IHttpClientFactory` / typed client
- [ ] JWT settings read from `IConfiguration`, key from User Secrets in dev

### Api
- [ ] Controllers inject only `ISender` (MediatR)
- [ ] `GlobalExceptionHandlerMiddleware` registered
- [ ] Swagger documents both auth schemes
- [ ] CORS policies defined for `:8080` and `:8082`

### SOLID Compliance
- [ ] No class has more than one reason to change (S)
- [ ] Adding a new AI provider requires zero edits to existing files (O)
- [ ] No interface throws `NotSupportedException` on any declared method (L)
- [ ] No class implements methods it doesn't use (I)
- [ ] No `new ConcreteService()` inside handlers or controllers (D)

---

*Generated for DYD project — May 2026*
