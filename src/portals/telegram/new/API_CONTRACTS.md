# Telegram Frontend API Integration

The new frontend reuses authenticated Telegram API calls already configured in SDLHUB. `telegramPSRAPI` sends credentials and uses the shared Axios interceptor, which adds the ERP CSRF token when available.

## Reused PHP operations

- `GET /telegram/counts`: aggregate group count, registered member count, and pending Telegram outbound-message count in one request.
- `POST /telegram/groups/list`: group records and joined member counts.
- `POST /telegram/groups/create`: PHP calls the MTProto service to create a group and persists the shared group record. The current MTProto implementation also adds the configured bot to the new group.
- `GET /telegram/members/list`: membership records.
- `POST /telegram/groups/divisions` and `POST /telegram/groups/departments`: organization filters.
- `POST /telegram/groups/list-hrms-members`: employee lookup; PHP requires `divsn_id` and `dept_id` and returns employee code, name, division, department, designation and cell. The current query does not accept a company filter.
- `POST /telegram/members/group-members` and `POST /telegram/members/save-member-dm`: existing direct-message queue flow.
- `POST /telegram/groups/save-broadcast-message`: existing group-broadcast queue flow.

## Backend gaps and constraints

### Employee invitations

- `POST /telegram/invitations/generate` accepts `{ group_id: <telegram_group_id>, employees: [{ employee_code }], expiry_days: 30, usage_limit: 1 }`. PHP resolves the Telegram group ID to its local row, validates the active group and employee against HRMS, then calls MTProto once per employee and persists the invite link, hash and expiry in `PSR_MEMBER_GROUP_MAPPING`. Each link is limited to one use and expires after 30 days; batch results report individual failures.
- `GET /telegram/invitations/mine` returns mappings for the authenticated session employee only.
- The MTProto update handler detects a group join. The PHP callback checks pending single-use invite links with `messages.GetChatInviteImporters`; when the joining Telegram user is found on a link, PHP stores the Telegram user ID on the employee record and mapping and marks the mapping `JOINED`.
- Apply `migrations/20261019_employee_telegram_invitations.sql` before enabling the endpoints. Links are private to the employee-scoped list endpoint.

### Telegram notification counts

`GET /telegram/counts` returns `GROUP_COUNT`, `MEMBER_COUNT`, and `PENDING_MESSAGE_COUNT`. The message queue tracks delivery status, not whether an administrator has read a message, so the UI labels this count as pending messages rather than unread messages. A true unread count requires a persisted read-state contract.

### Message history and delivery status

Broadcasts and direct messages are inserted into `PSR_MESSAGE_QUEUE`, but no message history/status listing endpoint was found in the PHP router. Add a paginated endpoint that exposes queue state and any sent/error timestamps. A queued request must not be presented as delivered.

### MTProto-only migration

The current PHP member-assignment service calls `WhatsAppNodeService` to deliver the shared invite URL. The group-create MTProto method also adds a bot. Removing those service dependencies and converting invitations to employee-specific MTProto links requires backend changes outside this frontend integration.