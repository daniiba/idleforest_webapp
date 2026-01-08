"use client";

const ProductHuntSection = () => {
  return (
    <section className="py-16 bg-brand-yellow/50 backdrop-blur-md border-t border-b border-brand-yellow/30">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Featured on Product Hunt
        </h2>
        <p className="text-lg text-brand-yellow mb-8 max-w-2xl">
          IdleForest was successfully launched on Product Hunt, the place to discover new tech. Check out our feature!
        </p>
        <a 
          href="https://www.producthunt.com/posts/idleforest?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-idleforest" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform duration-300 ease-in-out hover:scale-105 block shadow-xl rounded-lg overflow-hidden"
        >
          <img 
            src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=959849&theme=light&period=daily&t=1746278116574" 
            alt="IdleForest - Featured on Product Hunt" 
            width={250} 
            height={54} 
            className="block"
          />
        </a>
      </div>
    </section>
  );
};

export default ProductHuntSection;
