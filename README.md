# Finance Dashboard Frontend

Production-style React frontend integrated with an existing backend API.

## Tech Stack

- React + Vite (JavaScript)
- React Router
- Axios
- Modular service layer and guarded routes
- Responsive custom CSS

## Quick Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Run app:

```bash
npm run dev
```

Backend expected at `http://localhost:2000` by default.

## Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build

## Feature Coverage

- JWT authentication with local storage persistence
- Axios interceptor for Bearer token
- Role-aware route protection (viewer, analyst, admin)
- Dashboard integration:
  - `/api/dashboard/total-income`
  - `/api/dashboard/total-expense`
  - `/api/dashboard/net-balance`
  - `/api/dashboard/category-totals`
  - `/api/dashboard/monthly-trends`
  - `/api/dashboard/recent-transactions`
  - `/api/dashboard/summary`
- Records listing with filters, search, sorting, pagination
- Admin panel:
  - user role update
  - activate/deactivate users
  - create/update/delete records
- Loading, error, and empty states
- Toast notifications for request outcomes

## Folder Structure

```text
src/
	api/
		client.js
	components/
		admin/
		common/
		dashboard/
		layout/
		records/
	config/
		env.js
	context/
		AuthContext.jsx
		AuthContextValue.js
		ToastContext.js
	hooks/
		useAuth.js
		useToast.js
	lib/
		format.js
		http.js
		storage.js
	pages/
		AdminPage.jsx
		DashboardPage.jsx
		LoginPage.jsx
		NotFoundPage.jsx
		RecordsPage.jsx
	services/
		authService.js
		dashboardService.js
		recordsService.js
		usersService.js
	App.jsx
	main.jsx
	index.css
```

## Manual Test Flow

1. Login as `admin` user.
2. Verify Dashboard page loads all KPI, category, trends and recent APIs.
3. Open Records page and validate:
   - date/category/type filters
   - search
   - sorting
   - pagination
4. Open Admin page and validate:
   - users list loads
   - role update works
   - status activate/deactivate works
   - record create works
   - record edit works
   - record delete works
5. Login as `viewer` or `analyst`.
6. Verify Dashboard + Records are accessible.
7. Verify Admin route is blocked for non-admin roles.

## Optional GraphQL

`runGraphqlQuery` helper exists in dashboard service and can call `/graphql` when backend GraphQL is enabled.
