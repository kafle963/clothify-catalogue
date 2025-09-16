# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e5565837-9975-471a-95f0-6af75327c604

## Supabase Setup (Required for Full Functionality)

This project uses Supabase for authentication and data storage. To enable full functionality:

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Configure Environment Variables**
   - Copy your project URL and anon key from the Supabase dashboard
   - Update the `.env` file with your actual values:
     ```
     VITE_SUPABASE_URL=your_actual_supabase_url
     VITE_SUPABASE_ANON_KEY=your_actual_anon_key
     ```

3. **Run Database Migrations**
   - The project includes pre-built migrations in `supabase/migrations/`
   - You can run these using the Supabase CLI or by copying the SQL to your Supabase SQL editor
   - The migrations create tables for user profiles, orders, and order items

4. **Demo Mode**
   - If Supabase is not configured, the app will run in demo mode
   - You can still test the UI and functionality with mock data
   - Authentication will work locally but data won't persist

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e5565837-9975-471a-95f0-6af75327c604) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e5565837-9975-471a-95f0-6af75327c604) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)