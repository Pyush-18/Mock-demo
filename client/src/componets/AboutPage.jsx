import React from "react";
import { motion } from "framer-motion";
import aboutImg from "../assets/about.webp";
import {Link} from "react-router"

const AboutPage = () => {
  return (
    <section
      id="about"
      className="w-full  text-white py-20 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between"
    >
      <motion.div
        className="md:w-1/2 flex justify-center mb-12 md:mb-0"
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-700/30 rounded-full blur-3xl opacity-50"></div>
          <img
            src={aboutImg}
            alt="Chemistry Quiz Illustration"
            className="w-[90%] max-w-md rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-teal-700/30 rounded-full blur-3xl opacity-50"></div>
        </div>
      </motion.div>

      <motion.div
        className="md:w-1/2 text-center md:text-left md:pl-10"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Discover <span className="text-emerald-400">ChemQuiz</span>
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed mb-5">
          Welcome to{" "}
          <span className="font-semibold text-emerald-400">ChemQuiz</span> —
          your smart companion for mastering Chemistry through fun, interactive
          quizzes and concept-driven challenges. We make learning engaging,
          visual, and effective — helping you fall in love with
          molecules, reactions, and equations!
        </p>

        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Whether you’re preparing for competitive exams, improving
          fundamentals, or testing your speed and accuracy — our quizzes and
          analytics help you stay ahead. With instant feedback and topic-wise
          progress tracking, learning Chemistry has never been this enjoyable.
        </p>

        <Link to='/study' className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black font-semibold px-8 py-3 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transition-all duration-300 transform hover:scale-[1.02]">
          Explore Quizzes
        </Link>
      </motion.div>
    </section>
  );
};

export default AboutPage;

