import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 1,
    name: "Elegant Summer Dress",
    price: 89,
    originalPrice: 129,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop&crop=center"],
    category: "Women",
    description: "Beautiful coral pink summer dress with a flowing, feminine silhouette. Perfect for warm weather occasions, this dress features a flattering fit and elegant draping that moves gracefully with every step.",
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    isSale: true,
    inStock: true,
    averageRating: 4.8,
    totalReviews: 127,
    reviews: [
      {
        id: "r1-1",
        userId: "u1",
        userName: "Sarah M.",
        rating: 5,
        comment: "Absolutely love this dress! The fabric is so soft and the color is even more beautiful in person. Perfect for summer events.",
        date: "2024-01-15",
        verified: true,
        helpful: 23
      },
      {
        id: "r1-2",
        userId: "u2",
        userName: "Emily R.",
        rating: 4,
        comment: "Great quality dress, fits true to size. The only reason I'm giving 4 stars instead of 5 is that it wrinkles easily.",
        date: "2024-01-10",
        verified: true,
        helpful: 15
      },
      {
        id: "r1-3",
        userId: "u3",
        userName: "Jessica L.",
        rating: 5,
        comment: "Perfect for my beach vacation! Received so many compliments. The material is breathable and comfortable.",
        date: "2024-01-08",
        verified: true,
        helpful: 18
      }
    ]
  },
  {
    id: 2,
    name: "Classic White Button-Down Shirt",
    price: 65,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop&crop=center"],
    category: "Men",
    description: "Crisp white cotton button-down shirt with a modern tailored fit. Essential wardrobe staple perfect for business meetings, casual outings, or layering. Made from premium cotton for comfort and durability.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: false,
    inStock: true,
    averageRating: 4.6,
    totalReviews: 89,
    reviews: [
      {
        id: "r2-1",
        userId: "u4",
        userName: "Michael T.",
        rating: 5,
        comment: "Excellent quality shirt. The fit is perfect and the material feels premium. Worth every penny.",
        date: "2024-01-12",
        verified: true,
        helpful: 31
      },
      {
        id: "r2-2",
        userId: "u5",
        userName: "David K.",
        rating: 4,
        comment: "Good shirt overall. The tailored fit is great, but I wish it was a bit longer.",
        date: "2024-01-05",
        verified: true,
        helpful: 12
      }
    ]
  },
  {
    id: 3,
    name: "Luxury Brown Leather Handbag",
    price: 199,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop&crop=center"],
    category: "Accessories",
    description: "Sophisticated brown leather handbag with elegant hardware details. Features spacious interior compartments and a structured design that maintains its shape. Perfect for professional or everyday use.",
    sizes: ["One Size"],
    isNew: true,
    inStock: true,
    averageRating: 4.9,
    totalReviews: 156,
    reviews: [
      {
        id: "r3-1",
        userId: "u6",
        userName: "Amanda P.",
        rating: 5,
        comment: "This bag is absolutely gorgeous! The leather quality is exceptional and it fits everything I need. Highly recommend!",
        date: "2024-01-20",
        verified: true,
        helpful: 42
      },
      {
        id: "r3-2",
        userId: "u7",
        userName: "Rachel S.",
        rating: 5,
        comment: "Love the structured design and the color is perfect. Great investment piece that goes with everything.",
        date: "2024-01-14",
        verified: true,
        helpful: 28
      }
    ]
  },
  {
    id: 4,
    name: "Classic Blue Denim Jacket",
    price: 95,
    originalPrice: 125,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=600&fit=crop&crop=center"],
    category: "Unisex",
    description: "Timeless blue denim jacket in a classic wash. Features traditional styling with button closure and chest pockets. Perfect layering piece for casual outfits and everyday wear.",
    sizes: ["XS", "S", "M", "L", "XL"],
    isSale: true,
    inStock: true,
    averageRating: 4.4,
    totalReviews: 73,
    reviews: [
      {
        id: "r4-1",
        userId: "u8",
        userName: "Alex J.",
        rating: 4,
        comment: "Great classic denim jacket. Quality is good and the fit is comfortable. Love the vintage wash.",
        date: "2024-01-18",
        verified: true,
        helpful: 19
      }
    ]
  },
  {
    id: 5,
    name: "Elegant Black Evening Dress",
    price: 299,
    image: "https://images.unsplash.com/photo-1566479179817-c0c0e4b15c44?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1566479179817-c0c0e4b15c44?w=500&h=600&fit=crop&crop=center"],
    category: "Women",
    description: "Stunning black evening dress with sophisticated design details. Features an elegant silhouette perfect for formal events, dinner parties, and special occasions. Luxurious fabric with impeccable tailoring.",
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    inStock: true,
    averageRating: 4.9,
    totalReviews: 64,
    reviews: [
      {
        id: "r5-1",
        userId: "u9",
        userName: "Victoria M.",
        rating: 5,
        comment: "This dress is absolutely stunning! Perfect for my anniversary dinner. The quality is exceptional and it fits like a dream.",
        date: "2024-01-22",
        verified: true,
        helpful: 35
      }
    ]
  },
  {
    id: 6,
    name: "Stylish Crossbody Bag",
    price: 149,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop&crop=center"],
    category: "Accessories",
    description: "Compact and versatile crossbody bag in a neutral tone. Features adjustable strap, multiple compartments, and a modern minimalist design. Perfect for hands-free convenience and everyday use.",
    sizes: ["One Size"],
    inStock: true,
    averageRating: 4.3,
    totalReviews: 45,
    reviews: [
      {
        id: "r6-1",
        userId: "u10",
        userName: "Lisa W.",
        rating: 4,
        comment: "Nice compact bag perfect for everyday use. Good quality materials and the adjustable strap is convenient.",
        date: "2024-01-16",
        verified: true,
        helpful: 11
      }
    ]
  },
  {
    id: 7,
    name: "Comfortable Casual Trousers",
    price: 75,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop&crop=center"],
    category: "Men",
    description: "Relaxed-fit casual trousers in a versatile neutral color. Made from comfortable fabric blend perfect for everyday wear, weekend activities, and casual office environments.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    averageRating: 4.2,
    totalReviews: 38,
    reviews: [
      {
        id: "r7-1",
        userId: "u11",
        userName: "Mark R.",
        rating: 4,
        comment: "Comfortable trousers for casual wear. Good fit and the material is soft. Great for weekend outings.",
        date: "2024-01-11",
        verified: true,
        helpful: 8
      }
    ]
  },
  {
    id: 8,
    name: "Bohemian Midi Dress",
    price: 115,
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop&crop=center"],
    category: "Women",
    description: "Romantic bohemian-style midi dress with intricate details and flowing fabric. Features beautiful patterns and a flattering A-line silhouette perfect for daytime events and casual occasions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    isSale: true,
    inStock: true,
    averageRating: 4.7,
    totalReviews: 92,
    reviews: [
      {
        id: "r8-1",
        userId: "u12",
        userName: "Sophie C.",
        rating: 5,
        comment: "Love the bohemian style and the patterns are so beautiful! Perfect length and very comfortable to wear.",
        date: "2024-01-19",
        verified: true,
        helpful: 26
      }
    ]
  },
  {
    id: 9,
    name: "Premium Winter Coat",
    price: 249,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&h=600&fit=crop&crop=center"],
    category: "Unisex",
    description: "Sophisticated winter coat in a classic design. Features high-quality construction, warm lining, and timeless styling that works for both professional and casual settings.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    averageRating: 4.8,
    totalReviews: 67,
    reviews: [
      {
        id: "r9-1",
        userId: "u13",
        userName: "Chris H.",
        rating: 5,
        comment: "Excellent winter coat! Very warm and the quality is outstanding. Worth the investment for cold weather.",
        date: "2024-01-13",
        verified: true,
        helpful: 22
      }
    ]
  },
  {
    id: 10,
    name: "Modern Athletic Sneakers",
    price: 129,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop&crop=center",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop&crop=center"],
    category: "Accessories",
    description: "Sleek white athletic sneakers with modern design elements. Features comfortable cushioning, breathable materials, and versatile styling perfect for workouts, casual wear, and everyday activities.",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    inStock: true,
    averageRating: 4.5,
    totalReviews: 113,
    reviews: [
      {
        id: "r10-1",
        userId: "u14",
        userName: "Jordan P.",
        rating: 5,
        comment: "Great sneakers! Very comfortable for both workouts and casual wear. The design is sleek and modern.",
        date: "2024-01-17",
        verified: true,
        helpful: 29
      }
    ]
  }
];