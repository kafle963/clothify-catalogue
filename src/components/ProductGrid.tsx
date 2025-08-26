import ProductCard from "./ProductCard";
import dressImage from "@/assets/dress-1.jpg";
import shirtImage from "@/assets/shirt-1.jpg";
import bagImage from "@/assets/bag-1.jpg";

const mockProducts = [
  {
    id: 1,
    name: "Elegant Summer Dress",
    price: 89,
    originalPrice: 129,
    image: dressImage,
    category: "Women",
    isNew: true,
    isSale: true,
  },
  {
    id: 2,
    name: "Classic Cotton Shirt",
    price: 65,
    image: shirtImage,
    category: "Men",
    isNew: false,
  },
  {
    id: 3,
    name: "Premium Leather Handbag",
    price: 199,
    image: bagImage,
    category: "Accessories",
    isNew: true,
  },
  {
    id: 4,
    name: "Casual Denim Jacket",
    price: 95,
    originalPrice: 125,
    image: shirtImage,
    category: "Unisex",
    isSale: true,
  },
  {
    id: 5,
    name: "Silk Evening Gown",
    price: 299,
    image: dressImage,
    category: "Women",
    isNew: true,
  },
  {
    id: 6,
    name: "Designer Crossbody Bag",
    price: 149,
    image: bagImage,
    category: "Accessories",
  },
  {
    id: 7,
    name: "Linen Casual Pants",
    price: 75,
    image: shirtImage,
    category: "Men",
  },
  {
    id: 8,
    name: "Vintage Midi Dress",
    price: 115,
    originalPrice: 140,
    image: dressImage,
    category: "Women",
    isSale: true,
  },
];

const ProductGrid = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Collection</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of premium clothing and accessories for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product, index) => (
            <div 
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-md font-medium transition-smooth shadow-button">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;