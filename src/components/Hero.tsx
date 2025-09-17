import { useEffect, useState, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&crop=center",
    alt: "Fashion Collection",
    title: "New Season",
    subtitle: "Fashion Collection",
    description: "Discover the latest trends and timeless pieces for your wardrobe",
    ctaText: "Shop Collection",
    ctaLink: "/products",
    badge: "New Arrivals",
    gradient: "from-purple-600/90 via-blue-600/80 to-indigo-600/90"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=800&fit=crop&crop=center",
    alt: "Women's Collection",
    title: "Elegant",
    subtitle: "Women's Wear",
    description: "Sophisticated styles that empower your confidence every day",
    ctaText: "Shop Women",
    ctaLink: "/products?category=Women",
    badge: "Best Sellers",
    gradient: "from-rose-600/90 via-pink-600/80 to-purple-600/90"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center",
    alt: "Men's Collection",
    title: "Classic",
    subtitle: "Men's Style",
    description: "Refined looks for the modern gentleman's lifestyle",
    ctaText: "Shop Men",
    ctaLink: "/products?category=Men",
    badge: "Premium Quality",
    gradient: "from-slate-600/90 via-gray-600/80 to-zinc-600/90"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&crop=center",
    alt: "Accessories",
    title: "Complete",
    subtitle: "Your Look",
    description: "Perfect accessories to complement your unique style",
    ctaText: "Shop Accessories",
    ctaLink: "/products?category=Accessories",
    badge: "Trending",
    gradient: "from-slate-600/90 via-gray-700/80 to-slate-500/90"
  }
];

const Hero = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  const autoplayPlugin = Autoplay({ delay: 5000, stopOnInteraction: true });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setProgress(0);
    });
  }, [api]);

  // Progress bar animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2; // 5 seconds = 100 updates at 2% each
      });
    }, 100);

    return () => clearInterval(timer);
  }, [current]);

  const scrollTo = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  }, [api]);

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] min-h-[600px] sm:min-h-[700px] lg:min-h-[750px] overflow-hidden group">
      <Carousel
        plugins={[autoplayPlugin]}
        className="w-full h-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {heroSlides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full">
              <div className="relative h-full overflow-hidden">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-[3000ms] group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`}></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* Badge */}
                    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all duration-300 text-xs sm:text-sm px-3 py-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {slide.badge}
                      </Badge>
                    </div>
                    
                    {/* Title */}
                    <div className="space-y-2 sm:space-y-3" style={{ animationDelay: `${index * 200 + 100}ms` }}>
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight animate-fade-in-up">
                        {slide.title}
                      </h1>
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-light tracking-wide animate-fade-in-up">
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    {/* Description */}
                    <p className="text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: `${index * 200 + 200}ms` }}>
                      {slide.description}
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: `${index * 200 + 300}ms` }}>
                      <Button 
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold group/btn"
                        onClick={() => navigate(slide.ctaLink)}
                      >
                        {slide.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="lg"
                        className="border-2 border-white text-black hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold backdrop-blur-sm"
                        onClick={() => navigate('/products')}
                      >
                        Explore All
                      </Button>
                    </div>
                    
                    {/* Customer Reviews Snippet */}
                    <div className="flex items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: `${index * 200 + 400}ms` }}>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-600 text-slate-600" />
                        ))}
                      </div>
                      <span className="text-sm sm:text-base opacity-90">4.8/5 from 2,500+ reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Buttons */}
        <CarouselPrevious 
          className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-white/10 hover:bg-white/20 border-0 shadow-2xl backdrop-blur-lg z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 rounded-full"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
        </CarouselPrevious>
        
        <CarouselNext 
          className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-white/10 hover:bg-white/20 border-0 shadow-2xl backdrop-blur-lg z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 rounded-full"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
        </CarouselNext>
        
        {/* Enhanced Slide Indicators with Progress */}
        <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center space-x-3 sm:space-x-4 bg-black/20 backdrop-blur-lg rounded-full px-4 sm:px-6 py-2 sm:py-3">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`relative overflow-hidden transition-all duration-500 rounded-full ${
                  index === current - 1 
                    ? 'h-3 w-8 sm:h-4 sm:w-10 bg-white' 
                    : 'h-3 w-3 sm:h-4 sm:w-4 bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => scrollTo(index)}
              >
                {index === current - 1 && (
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/60 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Slide Counter */}
        <div className="absolute top-6 sm:top-8 right-6 sm:right-8 z-30 bg-black/20 backdrop-blur-lg rounded-full px-3 sm:px-4 py-2 border border-white/20">
          <span className="text-white text-sm sm:text-base font-medium">
            {current} / {count}
          </span>
        </div>
      </Carousel>
    </section>
  );
};

export default Hero;

// Add custom animations to index.css
// @keyframes fade-in-up {
//   from {
//     opacity: 0;
//     transform: translateY(30px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
// .animate-fade-in-up {
//   animation: fade-in-up 0.8s ease-out forwards;
//   opacity: 0;
// }