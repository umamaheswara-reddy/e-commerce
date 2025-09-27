namespace Shared.Events
{
    public class AccountRegisteredEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public DateTime RegisteredAt { get; set; }

        public AccountRegisteredEvent(Guid userId, string email, DateTime registeredAt)
        {
            UserId = userId;
            Email = email;
            RegisteredAt = registeredAt;
        }
    }
}
