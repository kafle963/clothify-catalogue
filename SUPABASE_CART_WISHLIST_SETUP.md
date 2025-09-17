# Supabase Cart & Wishlist Integration

This document describes the implementation of persistent cart and wishlist storage using Supabase.

## Database Schema

### Cart Items Table (`cart_items`)
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id)
- `product_id` (integer)
- `product_name` (text)
- `product_price` (decimal)
- `product_image` (text)
- `product_category` (text)
- `size` (text)
- `quantity` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Wishlist Items Table (`wishlist_items`)
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id)
- `product_id` (integer)
- `product_name` (text)
- `product_price` (decimal)
- `product_image` (text)
- `product_category` (text)
- `created_at` (timestamptz)

## Security & Access Control

### Row Level Security (RLS)
Both tables have RLS enabled with policies that ensure:
- Users can only read their own cart/wishlist items
- Users can only create items for themselves
- Users can only update/delete their own items

### Unique Constraints
- Cart items: `UNIQUE(user_id, product_id, size)` - prevents duplicate cart entries
- Wishlist items: `UNIQUE(user_id, product_id)` - prevents duplicate wishlist entries

## Implementation Features

### Cart Context (`CartContext.tsx`)
- **Dual Storage**: Items are stored in both Supabase and localStorage
- **Fallback Mode**: When Supabase is not configured, falls back to localStorage only
- **Real-time Sync**: All cart operations (add, remove, update) sync with Supabase
- **Loading States**: Provides loading indicators for async operations
- **Error Handling**: Graceful handling of network errors and Supabase issues

### Wishlist Context (`WishlistContext.tsx`)
- **Persistent Storage**: Wishlist items are stored in Supabase for logged-in users
- **Local Backup**: localStorage is used as backup and for non-authenticated users
- **Seamless Experience**: Users can add/remove items whether online or offline
- **Automatic Sync**: Items sync when user logs in

## Usage

### For Authenticated Users
When a user is logged in, all cart and wishlist operations are automatically persisted to Supabase:

```typescript
// Adding to cart - automatically syncs to Supabase
const { addItem } = useCart();
addItem(product, 'M', 2);

// Adding to wishlist - automatically syncs to Supabase
const { addToWishlist } = useWishlist();
addToWishlist(product);
```

### For Guest Users
When no user is logged in, items are stored in localStorage only:
- Cart items persist across browser sessions
- Wishlist items persist across browser sessions
- Data is lost if user clears browser data

### Migration on Login
When a user logs in:
1. Existing localStorage data is preserved
2. Supabase data is loaded and merged
3. Future operations sync to both localStorage and Supabase

## Database Migration

To apply the cart and wishlist tables to your Supabase project:

1. Run the migration file:
   ```bash
   supabase migration up
   ```

2. Or manually execute the SQL in the Supabase dashboard:
   ```sql
   -- See: supabase/migrations/20250917000001_create_cart_wishlist_tables.sql
   ```

## Configuration

The implementation automatically detects Supabase configuration:

```typescript
const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
```

## Performance Optimizations

- **Batch Operations**: Multiple cart/wishlist changes can be batched
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Caching**: localStorage serves as cache for faster load times
- **Indexes**: Database indexes on `user_id` and `product_id` for fast queries

## Error Handling

- Network failures fall back to localStorage-only mode
- Supabase errors are logged but don't break functionality
- User experience remains smooth regardless of backend issues
- Toast notifications inform users of sync status

## Future Enhancements

1. **Offline Support**: Queue operations when offline, sync when online
2. **Cross-Device Sync**: Real-time updates across multiple devices
3. **Analytics**: Track cart abandonment and wishlist conversion rates
4. **Bulk Operations**: Import/export cart and wishlist data