Backend Integration Notes

1. Base URL configuration

All frontend calls to the backend go through a single base URL defined in:
- src/lib/api-config.ts

Config:
- The base URL is resolved in this order:
  - NEXT_PUBLIC_API_BASE_URL (environment variable)
  - fallback: http://localhost:7878/api/v1 (for local development)

Example:
- For local development, create app/.env.local with:
  NEXT_PUBLIC_API_BASE_URL=http://localhost:7878/api/v1

2. Where backend endpoints are defined

All endpoint paths are built in one place:
- src/lib/api-config.ts

The apiEndpoints object defines helpers for:
- Users:
  - /users
  - /users/info
- Groups:
  - /groups
  - /groups/{group_id}/members
  - /groups/{group_id}/traits
  - /groups/{group_id}/process
- Recommendations:
  - /groups/{group_id}/recommendations
- Plans:
  - /groups/{group_id}/plan
  - /plans/by-group-name

No page or component should hardcode backend URLs; they must use:
- functions from src/lib/api-client.ts, which in turn use apiEndpoints.

3. How pages use the centralized client

- Auth (/auth):
  - Uses getUserInfo(email) from api-client.
  - Existing user -> loads from backend -> redirects /app.
  - New user (404) -> sets pending user -> redirects /survey.

- Survey (/survey):
  - Uses currentUser from store (email/name from /auth).
  - On completion calls createUser({ email, name, user_answer }).
  - On success -> updates persona in store -> redirects /welcome.

- App (/app):
  - On load:
    - Uses getUserInfo(currentUser.email) to fetch:
      - groups
      - members
      - existing plans
  - Generates plans:
    - Uses createPlanForGroup(groupId, { raw_data }) to call backend.
    - Renders plan_json.plan_options from response.

4. Deployment

To switch environments (dev/stage/prod):

- Set NEXT_PUBLIC_API_BASE_URL accordingly, for example:
  - Dev:
    NEXT_PUBLIC_API_BASE_URL=http://localhost:7878/api/v1
  - Prod:
    NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1

No code changes are required; all frontend calls respect this configuration.
