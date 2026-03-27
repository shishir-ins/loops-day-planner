# 🌿 Loops Day Planner

A beautiful day planner and task management system built with React, TypeScript, and Tailwind CSS. Features user task creation, material uploads, notifications, and a daily planner with automatic reset functionality.

## ✨ Features

### 📋 Task Management
- **Admin Panel**: Create and manage tasks for users
- **User Tasks**: Users can create their own tasks
- **Material Uploads**: Attach PDFs, images, and documents to tasks
- **Real-time Updates**: Live sync between admin and user
- **Notifications**: Browser notifications for new tasks and deadlines

### 📅 Daily Planner
- **Green & White Theme**: Clean, calming design
- **Auto-reset**: Clears data every day at midnight
- **Comprehensive Sections**: Mood, weather, sleep, water, schedule, meals, notes, and more
- **Local Storage**: Data persists throughout the day

### 🔐 Security
- **Passcode Protection**: Separate access for admin and user
- **Admin Passcode**: `loopsadmin`
- **User Passcode**: `iloveyou`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/[your-username]/loops-day-planner.git
cd loops-day-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
- User Page: http://localhost:8080/
- Admin Panel: http://localhost:8080/admin
- Daily Planner: http://localhost:8080/planner

## 🌐 Deployment

### Option 1: GitHub Pages (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[your-username]/loops-day-planner.git
git push -u origin main
```

2. **Enable GitHub Pages**
- Go to your repository on GitHub
- Settings → Pages
- Source: **GitHub Actions**
- Click Save

3. **Automatic Deployment**
- The GitHub Actions workflow will automatically build and deploy
- Your site will be available at: `https://[your-username].github.io/loops-day-planner/`

### Option 2: Manual Deployment

1. **Build for production**
```bash
npm run build
```

2. **Deploy dist folder**
- Upload the `dist` folder to your hosting service
- For GitHub Pages: drag and drop the `dist` contents to the `gh-pages` branch

### Option 3: Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

## 🗄️ Database Setup

### Supabase Setup

1. **Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Get your URL and API key

2. **Run Migrations**
```bash
# Apply the database schema
npx supabase db push
```

3. **Create Storage Bucket**
```sql
-- Create storage bucket for task materials
INSERT INTO storage.buckets (id, name, public) VALUES ('task-materials', 'task-materials', true);
```

## 📱 Access Instructions

### User Access
- **URL**: `https://[your-domain].com/`
- **Passcode**: `iloveyou`
- **Features**: View tasks, create tasks, upload materials, access planner

### Admin Access
- **URL**: `https://[your-domain].com/#/admin`
- **Passcode**: `loopsadmin`
- **Features**: Create tasks, manage all tasks, view notifications

### Daily Planner
- **URL**: `https://[your-domain].com/#/planner`
- **Access**: Click "Open Daily Planner 🌿" from user page
- **Features**: Full daily planning with auto-reset

## 🎨 Customization

### Colors
The theme uses green and white colors. To customize:
- Edit `tailwind.config.ts`
- Modify CSS variables in `src/index.css`

### Passcodes
Change the passcodes in:
- `src/pages/Index.tsx` (user passcode)
- `src/pages/Admin.tsx` (admin passcode)

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests
```

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── integrations/  # Supabase integration
└── types/         # TypeScript types
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

**Made with ❤️ for Loops** 🌿
