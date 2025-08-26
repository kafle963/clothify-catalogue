import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Categories />
      <ProductGrid />
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in Style
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and fashion trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md font-medium transition-smooth shadow-button whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-fashion-charcoal text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Clothify</h3>
              <p className="text-white/80 mb-4">
                Premium fashion for the modern lifestyle. Express yourself with confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-accent transition-smooth">About Us</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Size Guide</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-accent transition-smooth">Women</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Men</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Kids</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Accessories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-accent transition-smooth">FAQ</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Shipping Info</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Track Order</a></li>
                <li><a href="#" className="hover:text-accent transition-smooth">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Clothify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;