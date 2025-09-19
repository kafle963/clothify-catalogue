# Clothify Catalogue - E-commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase.

## Features

### 🛍️ Customer Experience
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Persistent cart with Supabase integration
- **Wishlist**: Save favorite products across sessions
- **User Authentication**: Secure login/signup with profile management
- **Order Management**: Complete checkout flow with order history
- **AI Assistant**: Intelligent shopping assistant for product recommendations

### 🏪 Vendor Portal
- **Vendor Registration**: Complete business profile setup
- **Product Management**: Add, edit, and manage product listings
- **Image Upload**: Local image upload with preview functionality
- **Dashboard Analytics**: Track sales, orders, and performance metrics
- **Approval Workflow**: Products require admin approval before going live

### 👨‍💼 Admin Panel
- **Vendor Management**: Approve/reject vendor applications
- **Product Moderation**: Review and approve product submissions
- **User Management**: Oversee customer and vendor accounts
- **Analytics Dashboard**: Platform-wide metrics and insights
- **Order Management**: Track and manage all platform orders

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (optional for demo mode)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd clothify-catalogue

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Accounts

The application includes demo accounts for testing:

#### Customer Account
- Email: `customer@clothify.com`
- Password: `customer123`

#### Vendor Account
- Email: `vendor@clothify.com`
- Password: `vendor123`

#### Admin Account
- Email: `admin@clothify.com`
- Password: `admin123`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Optional - app works in demo mode without)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Assistant Configuration (Optional)
VITE_AI_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_AI_API_KEY=your_openrouter_api_key
VITE_SITE_URL=https://your-site.com
VITE_SITE_NAME=Clothify Catalogue
```

### Supabase Setup (Optional)

If you want to use Supabase for data persistence:

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Update your `.env` file with the project URL and anon key

**Note**: The app works fully in demo mode without Supabase configuration.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   └── vendor/         # Vendor portal pages
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Static data and mock data
```

## Key Features

### Multi-User System
- **Customers**: Browse, shop, and manage orders
- **Vendors**: Sell products and manage business
- **Admins**: Oversee platform operations

### Product Management
- Image upload with validation and preview
- Category-based organization
- Size and inventory management
- Approval workflow for quality control

### Shopping Experience
- Advanced product search and filtering
- Persistent shopping cart
- Wishlist functionality
- Order tracking and history

### Admin Controls
- Vendor approval system
- Product moderation
- User management
- Platform analytics

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for consistent styling
- Component-based architecture

## Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the repository.