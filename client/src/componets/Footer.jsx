import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
const Footer = () => {

  return (
    <footer className=" text-gray-400 mt-10 border-t border-teal-800/50 rounded-tl-2xl rounded-tr-2xl">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-3xl font-bold text-teal-400 tracking-wider">
            ChemQuiz
          </h2>
          <p className="text-sm mt-4 leading-relaxed text-gray-500">
            Challenge your Chemistry knowledge with interactive quizzes,
            real-time scoring, and detailed feedback — designed for students who
            love learning science!
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-300">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-teal-400 transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Quizzes
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-teal-400 transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-300">Support</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-teal-400 transition-colors">
                FAQs
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-teal-400 transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-teal-400 transition-colors"
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-teal-300">
            Connect with Us
          </h3>
          <div className="flex space-x-5 mt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="text-gray-500 hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-500 hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-gray-500 hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-gray-500 hover:text-teal-400 transition-colors duration-300 transform hover:scale-110"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-teal-900 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} ChemQuiz. All rights reserved. Empowering
        next-gen learning.
      </div>
    </footer>
  );
};

export default Footer;
