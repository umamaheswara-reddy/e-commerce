# ----------- Base Runtime -----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 8080 8081


# ----------- Build Stage -----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy only .csproj files first for caching
COPY ["Identity.API/Identity.API.csproj", "Identity.API/"]
COPY ["Identity.Application/Identity.Application.csproj", "Identity.Application/"]
COPY ["Identity.Domain/Identity.Domain.csproj", "Identity.Domain/"]
COPY ["Identity.Infrastructure/Identity.Infrastructure.csproj", "Identity.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "Identity.API/Identity.API.csproj"

# Copy the rest of the source
COPY . .

# Build
WORKDIR "/src/Identity.API"
RUN dotnet build "Identity.API.csproj" -c $BUILD_CONFIGURATION -o /app/build


# ----------- Publish Stage -----------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Identity.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false


# ----------- Final Runtime -----------
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Copy HTTPS cert
COPY ["aspnetapp.pfx", "/https/aspnetapp.pfx"]

ENV ASPNETCORE_Kestrel__Certificates__Default__Path="/https/aspnetapp.pfx"
ENV ASPNETCORE_Kestrel__Certificates__Default__Password="password"
ENTRYPOINT ["dotnet", "Identity.API.dll"]