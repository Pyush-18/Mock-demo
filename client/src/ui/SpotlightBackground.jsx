import { motion } from "framer-motion";

const SpotlightBackground = () => {
  const spotlightVariant = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-[-1] w-full h-full bg-[#050505] overflow-hidden pointer-events-none">
      <motion.div
        variants={spotlightVariant}
        animate="animate"
        className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
      />

      <motion.div
        variants={spotlightVariant}
        animate="animate"
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2, 
        }}
        className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
      />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    </div>
  );
};

export default SpotlightBackground;
