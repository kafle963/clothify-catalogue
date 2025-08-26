import { Card } from "@/components/ui/card";

const categories = [
  {
    id: 1,
    name: "Women",
    description: "Elegant & Chic",
    count: "120+ items",
    gradient: "from-fashion-rose to-fashion-gold",
  },
  {
    id: 2,
    name: "Men",
    description: "Modern & Classic",
    count: "85+ items", 
    gradient: "from-fashion-charcoal to-fashion-sage",
  },
  {
    id: 3,
    name: "Kids",
    description: "Fun & Comfortable",
    count: "65+ items",
    gradient: "from-accent to-fashion-rose",
  },
  {
    id: 4,
    name: "Accessories",
    description: "Complete Your Look",
    count: "45+ items",
    gradient: "from-fashion-sage to-fashion-gold",
  },
];

const Categories = () => {
  return (
    <section className="py-16 bg-fashion-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">
            Find exactly what you're looking for in our curated collections
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className={`group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 animate-slide-up bg-gradient-to-br ${category.gradient}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-white/90 mb-3 text-lg">
                  {category.description}
                </p>
                <p className="text-white/80 text-sm font-medium">
                  {category.count}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-md text-sm font-medium">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;