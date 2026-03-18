# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Live Links

- **Frontend:** _[Add Vercel URL after deployment]_
- **Backend API:** _[Add Render URL after deployment]_

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Axios     |
| Backend    | Django 5, Django REST Framework         |
| Database   | PostgreSQL (Render) / SQLite (local)    |
| Deployment | Vercel (frontend), Render (backend)     |

## Features

### Core
- **Employee Management** — Add, view, and delete employees with unique IDs, names, emails, and departments
- **Attendance Tracking** — Mark daily attendance (Present/Absent) for each employee with one-record-per-day enforcement
- **Validation** — Server-side validation for required fields, email format, and duplicate prevention

### Bonus
- Dashboard with summary statistics (total employees, present/absent today)
- Filter attendance records by date range
- Per-employee present/absent day counts
- Professional UI with loading, empty, and error states

## Project Structure

```
├── backend/            # Django REST API
│   ├── api/            # Models, views, serializers, URLs
│   ├── hrms/           # Django project settings
│   ├── requirements.txt
│   ├── build.sh        # Render build script
│   └── Procfile        # Render start command
├── frontend/           # React SPA
│   ├── src/
│   │   ├── api/        # Axios API client
│   │   ├── components/ # Reusable UI components
│   │   └── pages/      # Dashboard, Employees, Attendance
│   ├── vercel.json     # Vercel SPA routing config
│   └── package.json
├── scripts/            # Startup scripts
│   ├── start-backend.sh    # Backend (Linux / macOS)
│   ├── start-frontend.sh   # Frontend (Linux / macOS)
│   ├── start-backend.bat   # Backend (Windows)
│   └── start-frontend.bat  # Frontend (Windows)
├── render.yaml         # Render infrastructure-as-code
└── README.md
```

---

## Running Locally

### Prerequisites

| Tool       | Minimum Version | Check Command          |
| ---------- | --------------- | ---------------------- |
| Python     | 3.10+           | `python3 --version`    |
| Node.js    | 18+             | `node --version`       |
| npm        | 8+              | `npm --version`        |
| Git        | any             | `git --version`        |

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-username>/takehometaskhrms.git
cd takehometaskhrms
```

### Step 2 — Start the Backend

> You need **two separate terminals** — one for the backend and one for the frontend.

<details>
<summary><strong>Linux / macOS (using script)</strong></summary>

```bash
chmod +x scripts/start-backend.sh   # only needed once
./scripts/start-backend.sh
```

</details>

<details>
<summary><strong>Windows (using script)</strong></summary>

```bat
scripts\start-backend.bat
```

</details>

<details>
<summary><strong>Manual (any OS)</strong></summary>

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate            # Linux / macOS
# venv\Scripts\activate             # Windows (Command Prompt)
# venv\Scripts\Activate.ps1         # Windows (PowerShell)

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the server
python manage.py runserver 8000
```

</details>

The API will be available at **http://localhost:8000/api/**.

Verify it works:
```bash
curl http://localhost:8000/api/dashboard/
# Expected: {"total_employees":0,"present_today":0,"absent_today":0,"date":"..."}
```

### Step 3 — Start the Frontend (second terminal)

<details>
<summary><strong>Linux / macOS (using script)</strong></summary>

```bash
chmod +x scripts/start-frontend.sh   # only needed once
./scripts/start-frontend.sh
```

</details>

<details>
<summary><strong>Windows (using script)</strong></summary>

```bat
scripts\start-frontend.bat
```

</details>

<details>
<summary><strong>Manual (any OS)</strong></summary>

```bash
cd frontend
npm install
npm run dev
```

</details>

The app will be available at **http://localhost:5173/**.

### What the scripts do

| Script                    | Platform       | Actions                                                             |
| ------------------------- | -------------- | ------------------------------------------------------------------- |
| `scripts/start-backend.sh`  | Linux / macOS  | Creates venv, installs pip deps, runs migrations, starts Django     |
| `scripts/start-backend.bat` | Windows        | Same as above using Windows-compatible commands                     |
| `scripts/start-frontend.sh` | Linux / macOS  | Installs npm deps (if needed), starts Vite dev server               |
| `scripts/start-frontend.bat`| Windows        | Same as above using Windows-compatible commands                     |

All scripts detect first run automatically — they skip venv creation / `npm install` on subsequent runs.

### Environment Variables (optional for local dev)

Defaults work out of the box for local development. Only create these files if you need to override values.

**Backend** — create `backend/.env`:

| Variable              | Description                        | Default (local)                                  |
| --------------------- | ---------------------------------- | ------------------------------------------------ |
| `DJANGO_SECRET_KEY`   | Django secret key                  | Auto-generated insecure key (dev only)           |
| `DEBUG`               | Debug mode                         | `True`                                           |
| `DATABASE_URL`        | Database connection string         | `sqlite:///db.sqlite3`                           |
| `ALLOWED_HOSTS`       | Comma-separated allowed hosts      | `localhost,127.0.0.1`                            |
| `CORS_ALLOWED_ORIGINS`| Comma-separated allowed origins    | `http://localhost:5173,http://127.0.0.1:5173`    |

**Frontend** — create `frontend/.env`:

| Variable              | Description                        | Default (local)                  |
| --------------------- | ---------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`   | Backend API base URL               | `http://localhost:8000/api`      |

---

## API Endpoints

| Method | Endpoint                | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/api/employees/`       | List all employees                    |
| POST   | `/api/employees/`       | Create a new employee                 |
| GET    | `/api/employees/{id}/`  | Get employee details                  |
| DELETE | `/api/employees/{id}/`  | Delete employee and attendance records|
| GET    | `/api/attendance/`      | List attendance (filterable)          |
| POST   | `/api/attendance/`      | Mark attendance                       |
| GET    | `/api/dashboard/`       | Dashboard summary statistics          |

**Attendance query parameters:**
- `employee_id` — Filter by employee ID
- `date_from` — Filter records from this date (YYYY-MM-DD)
- `date_to` — Filter records up to this date (YYYY-MM-DD)

---

## Deployment

The project is designed to be deployed with **Render** (backend + database) and **Vercel** (frontend). Both offer free tiers.

### Prerequisites for deployment

- A [GitHub](https://github.com) account with this repo pushed to it
- A [Render](https://render.com) account (free)
- A [Vercel](https://vercel.com) account (free)

### Part A — Push to GitHub

```bash
cd takehometaskhrms

git init
git add -A
git commit -m "Initial commit"

# Create a repo on GitHub, then:
git remote add origin https://github.com/<your-username>/takehometaskhrms.git
git branch -M main
git push -u origin main
```

### Part B — Deploy Backend + Database on Render

#### B1. Create a PostgreSQL database

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** > **PostgreSQL**
3. Fill in:
   - **Name:** `hrms-db`
   - **Database:** `hrms`
   - **User:** `hrms_user`
   - **Region:** pick the one closest to you
   - **Plan:** Free
4. Click **Create Database**
5. Once created, go to the database page and copy the **Internal Database URL** (starts with `postgresql://...`). You will need this in the next step.

#### B2. Create the backend Web Service

1. In Render Dashboard, click **New +** > **Web Service**
2. Connect your GitHub repo (`takehometaskhrms`)
3. Configure the service:

   | Setting          | Value                                                          |
   | ---------------- | -------------------------------------------------------------- |
   | **Name**         | `hrms-backend`                                                 |
   | **Root Directory**| `backend`                                                     |
   | **Runtime**      | Python                                                         |
   | **Build Command**| `./build.sh`                                                   |
   | **Start Command**| `gunicorn hrms.wsgi:application --bind 0.0.0.0:$PORT`         |
   | **Plan**         | Free                                                           |

4. Under **Environment Variables**, add:

   | Key                    | Value                                                                              |
   | ---------------------- | ---------------------------------------------------------------------------------- |
   | `DATABASE_URL`         | *(paste the Internal Database URL from step B1)*                                   |
   | `DJANGO_SECRET_KEY`    | *(any random string, e.g. generate one at https://djecrety.ir)*                    |
   | `DEBUG`                | `False`                                                                            |
   | `ALLOWED_HOSTS`        | `hrms-backend.onrender.com` *(replace with your actual Render domain)*             |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` *(you will update this after Vercel deploy)*    |
   | `PYTHON_VERSION`       | `3.10.12`                                                                          |

5. Click **Create Web Service**
6. Wait for the build to finish (2-3 minutes). Once deployed, note the service URL (e.g. `https://hrms-backend.onrender.com`).

#### B3. Verify the backend is live

```bash
curl https://hrms-backend.onrender.com/api/dashboard/
# Expected: {"total_employees":0,"present_today":0,"absent_today":0,"date":"..."}
```

> **Tip:** Render free tier spins down after 15 minutes of inactivity. The first request after idle may take 30-60 seconds.

### Part C — Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** > **Project**
3. Import the GitHub repo (`takehometaskhrms`)
4. Configure the project:

   | Setting               | Value                                                        |
   | --------------------- | ------------------------------------------------------------ |
   | **Root Directory**    | `frontend`                                                   |
   | **Framework Preset**  | Vite                                                         |
   | **Build Command**     | `npm run build` *(auto-detected)*                            |
   | **Output Directory**  | `dist` *(auto-detected)*                                     |

5. Under **Environment Variables**, add:

   | Key                  | Value                                                     |
   | -------------------- | --------------------------------------------------------- |
   | `VITE_API_BASE_URL`  | `https://hrms-backend.onrender.com/api` *(your Render URL + /api)* |

6. Click **Deploy**
7. Wait for the build to finish (1-2 minutes). Note the live URL (e.g. `https://takehometaskhrms.vercel.app`).

### Part D — Connect Frontend URL back to Render CORS

1. Go back to the Render dashboard > **hrms-backend** > **Environment**
2. Update the `CORS_ALLOWED_ORIGINS` variable:
   ```
   https://takehometaskhrms.vercel.app
   ```
   *(replace with your actual Vercel URL)*
3. Click **Save Changes** — Render will automatically redeploy.

### Part E — Final verification

1. Open your Vercel URL in a browser
2. Confirm the Dashboard loads with zeros (no errors)
3. Navigate to **Employees** > **Add Employee** > fill in the form > submit
4. Navigate to **Attendance** > mark attendance for the employee
5. Return to **Dashboard** and verify the counts update

> If the frontend shows a loading spinner that never resolves, check:
> - Render backend is awake (visit the `/api/dashboard/` URL directly)
> - `VITE_API_BASE_URL` on Vercel matches the Render URL exactly (with `/api` suffix)
> - `CORS_ALLOWED_ORIGINS` on Render matches the Vercel URL exactly (with `https://`)

### Deployment summary

```
GitHub Repo
  │
  ├──► Render (backend/)
  │      ├── PostgreSQL database (hrms-db)
  │      └── Web Service (hrms-backend)
  │            Build:  ./build.sh
  │            Start:  gunicorn hrms.wsgi:application
  │            URL:    https://hrms-backend.onrender.com
  │
  └──► Vercel (frontend/)
         Build:  npm run build
         URL:    https://takehometaskhrms.vercel.app
         Env:    VITE_API_BASE_URL → Render backend URL
```

---

## Assumptions & Limitations

- Single admin user — no authentication/authorization required
- Employee ID is user-provided (not auto-generated) and must be unique
- One attendance record per employee per day (enforced by unique constraint)
- Deleting an employee cascades to remove all their attendance records
- Leave management, payroll, and advanced HR features are out of scope
- Render free tier spins down after inactivity; first request may take 30-60 seconds to wake up
