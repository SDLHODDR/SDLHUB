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

### Unique employee invitations

The existing PHP route `POST /telegram/invite/generate` accepts `chat_id` and calls Telegram Bot API `createChatInviteLink`; it does not accept an employee, expiry or usage limit and does not persist an employee mapping or HR notification. It is not used by the new UI.

The Node MTProto service has `/generate-employee-invite` for a single `telegram_group_id` and `employee_code`, hardcodes a seven-day expiry and one-use limit, and returns a link. `TelegramNodeService::generateEmployeeInvite` wraps it, but no PHP route/controller calls that method. The helper does not persist invitation records or create employee notifications. A PHP operation is needed to validate access, generate one link per employee, persist the mapping and HR notification, handle partial batch failures and enforce idempotency. The existing member assignment route currently reuses the group-level `INVITE_LINK` and sends it through WhatsApp, so the new UI does not call it.

Suggested contract: `POST /telegram/invitations/generate` accepts `{ telegram_group_id, employee_codes, expiry_days: 30, usage_limit: 1, idempotency_key }` and returns per-employee status and invitation metadata. Link visibility must be restricted by backend authorization.

### Telegram notification counts

`GET /telegram/counts` returns `GROUP_COUNT`, `MEMBER_COUNT`, and `PENDING_MESSAGE_COUNT`. The message queue tracks delivery status, not whether an administrator has read a message, so the UI labels this count as pending messages rather than unread messages. A true unread count requires a persisted read-state contract.

### Message history and delivery status

Broadcasts and direct messages are inserted into `PSR_MESSAGE_QUEUE`, but no message history/status listing endpoint was found in the PHP router. Add a paginated endpoint that exposes queue state and any sent/error timestamps. A queued request must not be presented as delivered.

### MTProto-only migration

The current PHP member-assignment service calls `WhatsAppNodeService` to deliver the shared invite URL. The group-create MTProto method also adds a bot. Removing those service dependencies and converting invitations to employee-specific MTProto links requires backend changes outside this frontend integration.