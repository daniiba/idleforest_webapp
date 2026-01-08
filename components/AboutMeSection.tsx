import Image from 'next/image';
import Link from 'next/link';
import { Linkedin } from 'lucide-react'; // Assuming you use lucide-react icons

const AboutMeSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-black backdrop-blur-sm border-y border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
          <div className="md:mr-12 mb-8 md:mb-0 flex-shrink-0">
            <Image
              src="/dani.png" // Assuming dani.png is in the public folder
              alt="Daniel Ibañez Becker, Founder of IdleForest"
              width={180} // Increased size for better visibility
              height={180}
              className="rounded-full border-4 border-brand-yellow object-cover shadow-lg"
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Meet the Founder
            </h2>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              Hey, I'm Daniel, the person behind IdleForest. I've always been inspired by projects like Ecosia that use technology for good, and I wanted to find my own way to help our planet. That's what got me into coding and eventually led to creating IdleForest.
            </p>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              As a Full Stack Developer, I'm putting my skills to work here. IdleForest is just starting out, but my hope is that it can grow into something that makes a real difference – helping us all plant a lot of trees and contribute to a healthier Earth, simply and effectively.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link href="https://www.linkedin.com/in/daniel-iba%C3%B1ez-becker-b16821151/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-brand-yellow hover:bg-brand-yellow text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-lg shadow-md">
                <Linkedin className="w-5 h-5 mr-2" />
                Connect on LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
