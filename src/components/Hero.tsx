import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&crop=center",
    alt: "Fashion Collection",
    title: "New Season",
    subtitle: "Fashion Collection",
    description: "Discover the latest trends and timeless pieces for your wardrobe",
    gradient: "from-purple-600/90 via-blue-600/80 to-indigo-600/90"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=800&fit=crop&crop=center",
    alt: "Women's Collection",
    title: "Elegant",
    subtitle: "Women's Wear",
    description: "Sophisticated styles that empower your confidence every day",
    gradient: "from-rose-600/90 via-pink-600/80 to-purple-600/90"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center",
    alt: "Men's Collection",
    title: "Classic",
    subtitle: "Men's Style",
    description: "Refined looks for the modern gentleman's lifestyle",
    gradient: "from-slate-600/90 via-gray-600/80 to-zinc-600/90"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&crop=center",
    alt: "Accessories",
    title: "Complete",
    subtitle: "Your Look",
    description: "Perfect accessories to complement your unique style",
    gradient: "from-slate-600/90 via-gray-700/80 to-slate-500/90"
  }
];

const Hero = () => {
  const [api, setApi] = useState<CarouselApi>();
  
  const autoplayPlugin = Autoplay({ delay: 5000, stopOnInteraction: true });

  useEffect(() => {
    if (!api) {
      return;
    }
  }, [api]);

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] min-h-[600px] sm:min-h-[700px] lg:min-h-[750px] overflow-hidden">
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
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Gradient Overlay - Enhanced for better contrast */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-85`}></div>
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
                  <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* Title - Enhanced contrast */}
                    <div className="space-y-3 sm:space-y-4">
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white drop-shadow-lg">
                        {slide.title}
                      </h1>
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-wide text-white drop-shadow-md">
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    {/* Description - Enhanced readability */}
                    <p className="text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed text-white/95 drop-shadow-sm font-medium">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Hero;