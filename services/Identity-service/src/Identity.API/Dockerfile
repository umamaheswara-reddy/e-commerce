FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 9004
EXPOSE 9003

FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Only copy csproj files first
COPY ["Identity.API/src/Identity.API/Identity.API.csproj", "."]
COPY ["Identity.API/src/Identity.Application/Identity.Application.csproj", "Identity.Application/"]
COPY ["Identity.API/src/Identity.Domain/Identity.Domain.csproj", "Identity.Domain/"]
COPY ["Identity.API/src/Identity.Infrastructure/Identity.Infrastructure.csproj", "Identity.Infrastructure/"]

# Restore first
RUN dotnet restore "Identity.API.csproj"

# Now copy the rest of the source code
COPY Identity.API/src/Identity.API/ Identity.API/
COPY Identity.API/src/Identity.Application/ Identity.Application/
COPY Identity.API/src/Identity.Domain/ Identity.Domain/
COPY Identity.API/src/Identity.Infrastructure/ Identity.Infrastructure/

# Build
WORKDIR /src/Identity.API
RUN dotnet build "Identity.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Identity.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Identity.API.dll"]