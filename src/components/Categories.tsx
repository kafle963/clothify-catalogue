import { Card } from "@/components/ui/card";

const categories = [
  {
    id: 1,
    name: "Women",
    description: "Elegant & Chic",
    count: "120+ items",
    gradient: "from-slate-500 to-slate-400",
  },
  {
    id: 2,
    name: "Men",
    description: "Modern & Classic",
    count: "85+ items", 
    gradient: "from-slate-400 to-slate-500",
  },
  {
    id: 3,
    name: "Kids",
    description: "Fun & Comfortable",
    count: "65+ items",
    gradient: "from-accent to-slate-400",
  },
  {
    id: 4,
    name: "Accessories",
    description: "Complete Your Look",
    count: "45+ items",
    gradient: "from-fashion-sage to-slate-300",
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
              className={`group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-4 hover:scale-105 animate-slide-up bg-gradient-to-br ${category.gradient} relative`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-8 text-center text-white relative z-10">
                <h3 className="text-2xl font-bold mb-2 group-hover:scale-110 transition-all duration-300 group-hover:text-white">
                  {category.name}
                </h3>
                <p className="text-white/90 mb-3 text-lg group-hover:text-white transition-colors duration-300">
                  {category.description}
                </p>
                <p className="text-white/80 text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                  {category.count}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="inline-block bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/40 transition-all duration-300 border border-white/20">
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